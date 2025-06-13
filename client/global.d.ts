type User = {
  id: string;
  email: string;
  createdAt: string;
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
