import TournamentGeneratorClient from "./TournamentGeneratorClient";

export const metadata = {
  title: "Generador de Torneos | Admin Panel",
};

export default function TournamentGeneratorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 uppercase">
            Generador Estructural de Torneos
          </h1>
          <p className="text-muted-foreground mt-1">
            Herramienta matemática para calcular emparejamientos y visualizar el formato de los torneos antes de crearlos.
          </p>
        </div>
      </div>
      <TournamentGeneratorClient />
    </div>
  );
}
