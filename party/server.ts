import type { Party, Connection, Server } from "partykit/server";

type WordEntry = { word: string; category: string };
type PlayerInfo = { name: string; playerId: string; isHost: boolean; connId: string };

export default class GameServer implements Server {
  options = { hibernate: false };

  wordLists: Record<string, WordEntry[]> = {};
  usedWords: Record<string, Set<number>> = {}; // tracks used indices per player
  globalUsedWords: Set<string> = new Set(); // tracks all drawn words globally to avoid cross-player repeats
  players: PlayerInfo[] = [];
  currentWord: string | null = null;

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

    // Request word for drawing round — send opponent's unused word to requester
    if (data.type === "request-word") {
      const allPlayerIds = Object.keys(this.wordLists);
      const opponentId = allPlayerIds.length === 2
        ? allPlayerIds.find((id) => id !== data.requesterId) || allPlayerIds[0]
        : null;
      const opponentWords = opponentId ? this.wordLists[opponentId] || [] : [];
      const usedKey = data.requesterId; // track what this drawer has already drawn
      if (!this.usedWords[usedKey]) this.usedWords[usedKey] = new Set();

      // Find an unused word (not used by this drawer AND not drawn globally yet)
      let word: WordEntry | null = null;
      for (let i = 0; i < opponentWords.length; i++) {
        if (!this.usedWords[usedKey].has(i) && !this.globalUsedWords.has(opponentWords[i].word.toLowerCase())) {
          word = opponentWords[i];
          this.usedWords[usedKey].add(i);
          this.globalUsedWords.add(word.word.toLowerCase());
          break;
        }
      }
      // If all globally unused are exhausted, fall back to per-player unused only
      if (!word) {
        for (let i = 0; i < opponentWords.length; i++) {
          if (!this.usedWords[usedKey].has(i)) {
            word = opponentWords[i];
            this.usedWords[usedKey].add(i);
            this.globalUsedWords.add(word.word.toLowerCase());
            break;
          }
        }
      }
      // If truly all exhausted, reset this player's tracking and pick randomly
      if (!word && opponentWords.length > 0) {
        this.usedWords[usedKey] = new Set();
        const idx = Math.floor(Math.random() * opponentWords.length);
        word = opponentWords[idx];
        this.usedWords[usedKey].add(idx);
      }
      if (!word) word = { word: "corazón", category: "default" };

      this.currentWord = word.word;
      sender.send(JSON.stringify({ type: "word-to-draw", ...word }));
      return;
    }

    // Guess — server checks if correct since only drawer has the word
    if (data.type === "guess") {
      // Relay the guess to everyone else
      this.room.broadcast(message, [sender.id]);
      // Check correctness server-side
      if (this.currentWord && data.text.toLowerCase().trim() === this.currentWord.toLowerCase().trim()) {
        this.room.broadcast(JSON.stringify({
          type: "correct-guess",
          guesserName: data.name,
          word: this.currentWord,
        }));
        this.currentWord = null;
      }
      return;
    }

    // Skip word — drawer wants next word
    if (data.type === "skip-word") {
      this.currentWord = null;
      this.room.broadcast(message, [sender.id]);
      return;
    }

    // Everything else — relay to all other connections
    this.room.broadcast(message, [sender.id]);
  }
}
