import type { Party, Connection, Server } from "partykit/server";

type WordEntry = { word: string; category: string };
type PlayerInfo = { name: string; playerId: string; isHost: boolean; connId: string };

export default class GameServer implements Server {
  options = { hibernate: true };

  wordLists: Record<string, WordEntry[]> = {};
  players: PlayerInfo[] = [];

  constructor(public room: Party) {}

  onConnect(conn: Connection) {
    const count = [...this.room.getConnections()].length;
    this.room.broadcast(JSON.stringify({ type: "player-count", count }));
    // Send current roster to the new connection so they know who's already here
    if (this.players.length > 0) {
      conn.send(JSON.stringify({ type: "roster", players: this.players }));
    }
  }

  onClose(conn: Connection) {
    this.players = this.players.filter((p) => p.connId !== conn.id);
    const count = [...this.room.getConnections()].length;
    this.room.broadcast(JSON.stringify({ type: "player-count", count }));
  }

  onMessage(message: string, sender: Connection) {
    const data = JSON.parse(message);

    // Player announces themselves — server tracks and broadcasts roster
    if (data.type === "announce") {
      // Remove any existing entry for this player
      this.players = this.players.filter((p) => p.playerId !== data.playerId);
      this.players.push({
        name: data.name,
        playerId: data.playerId,
        isHost: data.isHost,
        connId: sender.id,
      });
      // Broadcast full roster to everyone
      this.room.broadcast(
        JSON.stringify({ type: "roster", players: this.players })
      );
      return;
    }

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
      const allPlayerIds = Object.keys(this.wordLists);
      const opponentWords =
        allPlayerIds.length === 2
          ? this.wordLists[
              allPlayerIds.find((id) => id !== data.requesterId) ||
                allPlayerIds[0]
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
