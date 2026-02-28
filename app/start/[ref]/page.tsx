import { FC } from "react";

interface StartPageProps {
  params: Promise<{ ref: string }>;
}

const StartPage: FC<StartPageProps> = async ({ params }) => {
  const { ref } = await params;
  return (
    <main>
      <div>{ref}</div>
    </main>
  );
};

export default StartPage;
