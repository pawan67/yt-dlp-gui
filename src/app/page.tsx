import { VideoDownloader } from "@/components/VideoDownloader";
import { Header } from "@/components/Header";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

export default function Home() {
  return (
    <ResponsiveLayout>
      <Header />
      <VideoDownloader />
    </ResponsiveLayout>
  );
}
