
import { FC } from "react";

interface ProcessingPageProps {
  params: Promise<{ ref: string }>;
}

const ProcessingPage: FC<ProcessingPageProps> = async ({ params }) => {
  const { ref } = await params;
    

  return (
    <main>
      <div>{ref}</div>
    </main>
  );
};

export default ProcessingPage;
