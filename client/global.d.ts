type User = {
  uid: string;
  email: string;
};

type Slate = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  shared: boolean;
  authorId: string;
};

type SlateMinimal = {
  name: string;
  id: string;
};
