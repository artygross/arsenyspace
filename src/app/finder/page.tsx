import { FinderQuiz } from "@/components/finder-quiz";

export const metadata = {
  title: "Подбор очков по форме лица",
  description:
    "Четыре вопроса о форме лица, силуэте, размере и бюджете — и каталог перестраивается под вас.",
};

export default function FinderPage() {
  return <FinderQuiz />;
}
