export interface InviteProp{
  token: string;
  inviter:{
    id: string;
    name: string;
    email: string;
    organization: string;
  },
  invitee:{
    name: string;
    email: string;
    role: string;
  }
  status: "pending" | "used";
  expiredAt: FirebaseFirestore.FieldValue;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt:FirebaseFirestore.FieldValue;
}
