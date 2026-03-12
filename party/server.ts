import type { Party, Connection, Server } from "partykit/server";

type WordEntry = { word: string; category: string };

export default class GameServer implements Server {
  options = { hibernate: true };

  wordLists: Record<string, WordEntry[]> = {};

  constructor(public room: Party) {}

  onConnect(conn: Connection) {
    const count = [...this.room.getConnections()].length;
    this.room.broadcast(JSON.stringify({ type: "player-count", count }));
  }

  onClose(conn: Connection) {
    const count = [...this.room.getConnections()].length;
    this.room.broadcast(JSON.stringify({ type: "player-count", count }));
  }

  onMessage(message: string, sender: Connection) {
    const data = JSON.parse(message);

    // Secret word submission — store but don't relay
    if (data.type === "submit-words") {
      this.wordLists[data.playerId] = data.words;
      sender.send(
        JSON.stringify({ type: "words-received", playerId: data.playerId })
      );
      this.room.broadcast(
        JSON.stringify({
          type: "partner-words-ready",
          playerId: data.playerId,
        }),
        [sender.id]
      );
      return;
    }

    // Request word for drawing round — send opponent's word to requester
    if (data.type === "request-word") {
      const opponentId = data.opponentId;
      // Find opponent's words by checking all stored lists
      const allPlayerIds = Object.keys(this.wordLists);
      const opponentWords =
        allPlayerIds.length === 2
          ? this.wordLists[
              allPlayerIds.find((id) => id !== data.requesterId) || allPlayerIds[0]
            ] || []
          : [];
      const wordIndex = data.wordIndex % Math.max(opponentWords.length, 1);
      const word =
        opponentWords.length > 0
          ? opponentWords[wordIndex]
          : { word: "corazón", category: "default" };
      sender.send(JSON.stringify({ type: "word-to-draw", ...word }));
      return;
    }

    // Everything else — relay to all other connections
    this.room.broadcast(message, [sender.id]);
  }
}
