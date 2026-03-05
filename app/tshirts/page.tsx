import Header from "@/components/Header";
import TShirtSurveyClient from "./TShirtSurveyClient";

export default function TShirtsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <TShirtSurveyClient readOnly />
      </main>
    </>
  );
}
