import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/lib/data";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <SmoothScroll>
      <div className="grain relative min-h-screen">
        <Header logoUrl={settings.logoUrl} />
        <main>{children}</main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
