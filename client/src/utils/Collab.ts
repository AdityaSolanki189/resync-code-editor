import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view"
import { Text, ChangeSet } from "@codemirror/state"
import { Update, receiveUpdates, sendableUpdates, collab, getSyncedVersion } from "@codemirror/collab"
import { Socket } from "socket.io-client"
import { MessageType, Message } from "@adi_solanki21/resync_common_module";

interface ServerMessage {
    sender: string;
    message: string;
    type: MessageType; // Assuming you have an enum for message types
}

function pushUpdates(
    socket: Socket,
    version: number,
    fullUpdates: readonly Update[],
    roomId: string
): Promise<ServerMessage> { // Return the server message

    const updates = fullUpdates.map(u => ({
        clientID: u.clientID,
        changes: u.changes.toJSON(),
        effects: u.effects
    }));

    return new Promise(function (resolve, reject) { // Handle both success and error
        socket.emit('pushUpdates', { roomId, version, updates: JSON.stringify(updates) });

        socket.once('message', function (message: ServerMessage) { // Listen for 'message' event
            if (message.type === Message.Enum["SUCCESS"]) {
                resolve(message); 
            } else {
                reject(message); // Reject the promise on error
            }
        });
    });
}

interface PullUpdatesResponse {
    updates: string; // The updates will always be a stringified JSON array
}

function pullUpdates(
    socket: Socket,
    version: number,
    roomId: string
): Promise<readonly Update[]> {
    return new Promise<readonly Update[]>((resolve) => {
        socket.emit('pullUpdates', { roomId, version });

        socket.once('pullUpdateResponse', (response: PullUpdatesResponse) => { // Type the response
            const updates: Update[] = JSON.parse(response.updates); // Parse the updates
            resolve(updates.map((u) => ({
                changes: ChangeSet.fromJSON(u.changes),
                clientID: u.clientID
            })));
        });
    });
}

export function getDocument(socket: Socket, roomId: string): Promise<{version: number, doc: Text}> {
	return new Promise(function(resolve) {
		socket.emit('getDocument', { roomId });

		socket.once('getDocumentResponse', function(version: number, doc: string) {
			resolve({
				doc: Text.of(doc.split("\n")),
				version,
			});
		});
	});
}

export const peerExtension = (socket: Socket, startVersion: number, roomId: string) => {
	const plugin = ViewPlugin.fromClass(class {
		private pushing = false
		private done = false

		constructor(private view: EditorView) { this.pull() }

		update(update: ViewUpdate) {
			if (update.docChanged || update.transactions.length) this.push()
		}

		async push() {
            const updates = sendableUpdates(this.view.state);
            if (this.pushing || !updates.length) return;

            this.pushing = true;
            const version = getSyncedVersion(this.view.state);

            try {
                const responseMessage: ServerMessage = await pushUpdates(socket, version, updates, roomId);
                // Handle success or specific errors here if needed
                if (responseMessage.type !== Message.Enum["SUCCESS"]) {
                    // Handle error message (e.g., display notification, log error)
                    console.error("Push updates failed:", responseMessage.message);
                }
            } catch (error) {
                // Handle general errors during push updates
                console.error("Error during push updates:", error);
            } finally {
                this.pushing = false;

                // Retry if there are remaining updates
                if (sendableUpdates(this.view.state).length) {
                    setTimeout(() => this.push(), 100);
                }
            }
        }


		async pull() {
			while (!this.done) {
				const version = getSyncedVersion(this.view.state)
				const updates = await pullUpdates(socket, version, roomId)
				this.view.dispatch(receiveUpdates(this.view.state, updates))
			}
		}

		destroy() { this.done = true }
	})

	
	return [ collab({ startVersion }), plugin ]
}
