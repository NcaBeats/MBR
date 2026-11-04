import { SignUpForm } from "./SignUpForm";

type Props = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return <SignUpForm next={typeof next === "string" ? next : null} />;
}
