import ProdeSection from "@/components/ProdeSection";

export const metadata = {
  title: "Prode - Liga TPM",
  description: "Pronostica los resultados de los partidos y compite en el Prode de la Liga TPM.",
};

export default function ProdePage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-black neon-text mb-4">Prode TPM</h1>
        <p className="text-muted-foreground">
          Aquí puedes ver todos los partidos del prode, tanto los activos para pronosticar como los ya jugados.
        </p>
      </div>

      <ProdeSection activeOnly={false} />
    </div>
  );
}
