import { LogInForm } from "./LogInForm";

type Props = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LogInPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return <LogInForm next={typeof next === "string" ? next : null} />;
}
