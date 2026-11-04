import { UserRole } from "./User";

export type Profile = {
  userId: number;
  nickname: string;
  avatarImage: string | null;
  bio: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  run: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  regionId: number | null;
  region: string | null;
  comunaId: number | null;
  comuna: string | null;
  address: string;
  createdAt: string;
};

export type AdminUser = {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string;
  profile: Profile;
};

export type AdminUserUpdateInput = {
  email: string;
  role: UserRole;
  password?: string;
};
