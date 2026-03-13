import { ThemeImage } from "@/components/ThemeImage";

interface StartHeaderProps {
  formattedAmount: string;
}

const StartHeader = ({ formattedAmount }: StartHeaderProps) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card/80 p-8 shadow-sm backdrop-blur">
          
        
        <ThemeImage
          lightSrc="/swish-konferenspasset.svg"
          darkSrc="/swish-konferenspasset-white.png"
          alt="Swish"
          width={160}
          height={200}
          className="h-16 w-auto"
          
        />
      
      
    </div>
  );
};

export default StartHeader;
