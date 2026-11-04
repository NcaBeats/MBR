import { describe, test, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { UserEditForm } from "@/app/(admin)/admin/users/[id]/UserEditForm";
import { AlertProvider } from "@/components/feedback";
import { updateUserAction, updateUserProfileAction } from "@/actions/admin";
import type { AdminUser } from "@/types";

const { push, refresh } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/actions/admin", () => ({
  updateUserAction: vi.fn(),
  updateUserProfileAction: vi.fn(),
}));

vi.mock("@/lib/api/regions", () => ({
  getRegionsClient: vi.fn().mockResolvedValue([]),
  getComunasClient: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/components/feedback", () => ({
  AlertProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useAlert: () => ({ showAlert: vi.fn(), alerts: [], dismissAlert: vi.fn() }),
}));

const mockedUpdateUser = vi.mocked(updateUserAction);
const mockedUpdateProfile = vi.mocked(updateUserProfileAction);

const user: AdminUser = {
  id: 3,
  email: "user@gmail.com",
  role: "CLIENTE",
  createdAt: "2026-01-01T00:00:00Z",
  profile: {
    userId: 3,
    nickname: "nick",
    avatarImage: null,
    bio: null,
    visibility: "PUBLIC",
    run: "111111111",
    firstName: "Nico",
    lastName: "Carvajal",
    birthDate: null,
    regionId: null,
    region: null,
    comunaId: null,
    comuna: null,
    address: "Calle 123",
    createdAt: "2026-01-01T00:00:00Z",
  },
};

const renderForm = () =>
  render(
    <AlertProvider>
      <UserEditForm user={user} />
    </AlertProvider>,
  );

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UserEditForm", () => {
  test("email inválido muestra error de campo", async () => {
    renderForm();
    const input = screen.getByLabelText(/email/i);
    fireEvent.change(input, { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Invalid email format")).toBeInTheDocument();
    expect(mockedUpdateUser).not.toHaveBeenCalled();
  });

  test("válido llama a ambas actions con el payload mapeado", async () => {
    mockedUpdateUser.mockResolvedValue({ ok: true });
    mockedUpdateProfile.mockResolvedValue({ ok: true });
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Save changes")).toBeInTheDocument();
    expect(mockedUpdateUser).toHaveBeenCalledWith(3, {
      email: "user@gmail.com",
      role: "CLIENTE",
      password: undefined,
    });
    expect(mockedUpdateProfile).toHaveBeenCalledWith(
      3,
      expect.objectContaining({
        nickname: "nick",
        firstName: "Nico",
        birthDate: null,
        comunaId: null,
      }),
    );
    expect(push).toHaveBeenCalledWith("/admin/users");
  });

  test("cambiar el rol por select lo envía en el payload", async () => {
    mockedUpdateUser.mockResolvedValue({ ok: true });
    mockedUpdateProfile.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByLabelText(/Role/));
    await user.click(await screen.findByRole("option", { name: "VENDEDOR" }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Save changes")).toBeInTheDocument();
    expect(mockedUpdateUser).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ role: "VENDEDOR" }),
    );
  });
});
