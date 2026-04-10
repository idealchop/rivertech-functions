export interface InquiryProp {
  firstName : string,
  lastName: string,
  email: string,
  phone: number,
  inquiry: string,
  business: object | null,
  message: string | null,
  status: string,
  createdAt: FirebaseFirestore.FieldValue,
  updatedAt: FirebaseFirestore.FieldValue,
}
