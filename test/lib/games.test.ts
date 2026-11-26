import { describe, test, expect, vi, afterEach } from "vitest";
import { getGames, getGameById } from "@/lib/api/games";

afterEach(() => {
  vi.unstubAllGlobals();
});

const mockFetch = (data: unknown, { ok = true, status = 200 } = {}) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(""),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("Games Test", () => {
  test("getGames devuelve catálogo", async () => {
    mockFetch({ content: [{ id: 1, name: "GTA VI" }] });

    const games = await getGames();
    expect(games).toHaveLength(1);
    expect(games[0]?.name).toBe("GTA VI");
  });

  test("getGameById pide /games/:id", async () => {
    const fetchMock = mockFetch({ id: 7, name: "Hades" });
    const game = await getGameById(7);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/games/7"),
      expect.objectContaining({ method: "GET" }),
    );
    expect(game.name).toBe("Hades");
  });

  test("getGames lanza error si la API responde 500", async () => {
    mockFetch({}, { ok: false, status: 500 });
    await expect(getGames()).rejects.toThrow();
  });
});
