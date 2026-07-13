import fs from 'fs';

const extraSchema = `
model ChallengeTournament {
  id           String                 @id @default(uuid())
  name         String
  type         String                 // SHOOTING, FREE_KICK, PENALTYS, VOLLEY
  status       String                 @default("UPCOMING") // UPCOMING, ONGOING, FINISHED
  bracketData  String                 @db.Text @default("{}")
  groupsData   String                 @db.Text @default("[]") // For manual room scores
  createdAt    DateTime               @default(now())
  
  participants ChallengeParticipant[]
  trophies     Trophy[]
}

model ChallengeParticipant {
  id           String               @id @default(uuid())
  playerId     String
  tournamentId String
  createdAt    DateTime             @default(now())

  player       Player               @relation(fields: [playerId], references: [id], onDelete: Cascade)
  tournament   ChallengeTournament  @relation(fields: [tournamentId], references: [id], onDelete: Cascade)

  @@unique([playerId, tournamentId])
}
`;

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!schema.includes("model ChallengeTournament")) {
    // Add missing relation to Player
    schema = schema.replace(
        '  trophies        Trophy[]',
        '  trophies        Trophy[]\n  challenges      ChallengeParticipant[]'
    );
    // Add missing relation to Trophy
    schema = schema.replace(
        '  tournamentId String?',
        '  tournamentId String?\n  challengeId  String?'
    );
    schema = schema.replace(
        '  tournament   Tournament? @relation(fields: [tournamentId], references: [id])',
        '  tournament   Tournament? @relation(fields: [tournamentId], references: [id])\n  challenge    ChallengeTournament? @relation(fields: [challengeId], references: [id])'
    );
    
    fs.writeFileSync('prisma/schema.prisma', schema + "\n" + extraSchema);
    console.log("Appended Challenge schema");
} else {
    console.log("Already appended");
}
