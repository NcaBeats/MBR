import { fetchAPI } from "./fetch";
import type {
  Game,
  Category,
  Library,
  Profile,
  Purchase,
  User,
  AdminUser,
  AdminUserUpdateInput,
  GameUpdateInput,
  Paginated,
} from "@/types";

export const getGames = async (): Promise<Game[]> => {
  const page = await fetchAPI<{ content: Game[] }>("/games?size=100");
  return page.content;
};

export const getGameById = (id: number): Promise<Game> =>
  fetchAPI<Game>("/games/" + id);

export type GameStats = {
  total: number;
  active: number;
  catalogValue: number;
};

export const getGameStats = (): Promise<GameStats> =>
  fetchAPI<GameStats>("/games/stats");

export const getDiscountedGames = async (): Promise<Game[]> => {
  const page = await fetchAPI<{ content: Game[] }>("/games/discounted");
  return page.content;
};

export const getBannerGames = async (): Promise<Game[]> => {
  const page = await fetchAPI<{ content: Game[] }>("/games/banners?size=4");
  return page.content;
};

export const getRecentGames = async (size = 10): Promise<Game[]> => {
  const page = await fetchAPI<{ content: Game[] }>(
    `/games/recent?size=${size}`,
  );
  return page.content;
};

export const getFreeToPlayGames = async (): Promise<Game[]> => {
  const page = await fetchAPI<{ content: Game[] }>(
    "/games/free-to-play?size=12",
  );
  return page.content;
};

export const getComingSoonGames = async (): Promise<Game[]> => {
  const page = await fetchAPI<{ content: Game[] }>(
    "/games/coming-soon?size=12",
  );
  return page.content;
};

export const getCategories = async (): Promise<Category[]> => {
  const page = await fetchAPI<{ content: Category[] }>("/categories?size=50");
  return page.content;
};

export const getMyLibrary = async (): Promise<Library[]> => {
  const page = await fetchAPI<{ content: Library[] }>("/library?size=50", {
    auth: true,
  });
  return page.content;
};

export type GamesFilter = {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
};

export const getGamesFiltered = ({
  name,
  minPrice,
  maxPrice,
  page = 0,
  size = 10,
}: GamesFilter): Promise<Paginated<Game>> => {
  const params = new URLSearchParams();
  if (name) params.set("name", name);
  if (minPrice !== undefined) params.set("minPrice", String(minPrice));
  if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
  params.set("page", String(page));
  params.set("size", String(size));
  return fetchAPI<Paginated<Game>>("/games?" + params.toString());
};

export const getAdminUsers = (
  page = 0,
  size = 10,
  email?: string,
  sort?: string,
): Promise<Paginated<User>> =>
  fetchAPI<Paginated<User>>(
    "/users?page=" +
      page +
      "&size=" +
      size +
      (email ? "&email=" + encodeURIComponent(email) : "") +
      (sort ? "&sort=" + encodeURIComponent(sort) : ""),
    { auth: true },
  );

export const getAdminUser = async (id: number): Promise<AdminUser> => {
  const user = await fetchAPI<User>(`/users/${id}`, { auth: true });
  // Sin perfil se edita desde uno vacío (usuarios previos a region/comuna).
  const profile = await fetchAPI<Profile>(`/profile/${id}`, {
    auth: true,
  }).catch((): Profile => ({
    userId: id,
    nickname: "",
    avatarImage: null,
    bio: null,
    visibility: "PUBLIC",
    run: "",
    firstName: "",
    lastName: "",
    birthDate: null,
    regionId: null,
    region: null,
    comunaId: null,
    comuna: null,
    address: "",
    createdAt: user.createdAt,
  }));
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    profile,
  };
};

export const getAdminGames = (
  page = 0,
  size = 10,
  name?: string,
): Promise<Paginated<Game>> =>
  fetchAPI<Paginated<Game>>(
    "/games?page=" +
      page +
      "&size=" +
      size +
      (name ? "&name=" + encodeURIComponent(name) : ""),
  );

export const getAdminGameById = (id: number): Promise<Game> =>
  fetchAPI<Game>("/games/" + id);

export const getManageGames = (
  page = 0,
  size = 10,
  name?: string,
  state?: string,
  sort?: string,
): Promise<Paginated<Game>> =>
  fetchAPI<Paginated<Game>>(
    "/manage/games?page=" +
      page +
      "&size=" +
      size +
      (name ? "&name=" + encodeURIComponent(name) : "") +
      (state ? "&state=" + encodeURIComponent(state) : "") +
      (sort ? "&sort=" + encodeURIComponent(sort) : ""),
    { auth: true },
  );

export const getManageGameById = (id: number): Promise<Game> =>
  fetchAPI<Game>("/manage/games/" + id, { auth: true });

export const getManageOrders = (
  page = 0,
  size = 10,
  sort?: string,
): Promise<Paginated<Purchase>> =>
  fetchAPI<Paginated<Purchase>>(
    "/manage/orders?page=" +
      page +
      "&size=" +
      size +
      (sort ? "&sort=" + encodeURIComponent(sort) : ""),
    {
      auth: true,
    },
  );

export const getManageOrder = (id: number): Promise<Purchase> =>
  fetchAPI<Purchase>("/manage/orders/" + id, { auth: true });

export const updateAdminUser = (
  id: number,
  input: AdminUserUpdateInput,
): Promise<User> =>
  fetchAPI<User>("/users/" + id, {
    method: "PUT",
    body: input,
    auth: true,
  });

export const updateAdminUserProfile = (
  id: number,
  input: {
    nickname?: string;
    bio?: string | null;
    visibility?: "PUBLIC" | "PRIVATE";
    firstName?: string;
    lastName?: string;
    birthDate?: string | null;
    region?: string | null;
    comuna?: string | null;
    address?: string;
  },
): Promise<AdminUser> =>
  fetchAPI<AdminUser>("/profile/" + id, {
    method: "PATCH",
    body: input,
    auth: true,
  });

export const updateAdminGame = (
  id: number,
  input: GameUpdateInput,
): Promise<Game> =>
  fetchAPI<Game>("/games/" + id, {
    method: "PUT",
    body: {
      name: input.name,
      originalPrice: input.originalPrice,
      discountPercent: input.discountPercent,
      description: input.description,
      state: input.state,
      launchDate: input.launchDate,
      categoryNames: input.categoryNames,
    },
    auth: true,
  });
