const fs = require('fs');
const path = require('path');
const schemaPath = path.join('prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');
content += `

model SignatureLobby {
  id        String      @id @default(uuid())
  title     String
  status    String      @default("OPEN") // OPEN, CLOSED
  createdAt DateTime    @default(now())
  signatures Signature[]
}

model Signature {
  id          String         @id @default(uuid())
  lobbyId     String
  lobby       SignatureLobby @relation(fields: [lobbyId], references: [id], onDelete: Cascade)
  
  userId      String?
  user        User?          @relation(fields: [userId], references: [id])
  
  ip          String
  fingerprint String
  
  country     String?        // País en español
  city        String?        // Ciudad
  isp         String?        // Proveedor de internet
  
  createdAt   DateTime       @default(now())

  @@unique([lobbyId, userId])
}
`;
fs.writeFileSync(schemaPath, content);
console.log('Appended to schema.prisma');
