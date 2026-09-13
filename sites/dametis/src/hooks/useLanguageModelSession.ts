import { type UseQueryResult, useQuery } from "@tanstack/react-query";

export const useLanguageModelSession = (): UseQueryResult<
  LanguageModel,
  Error
> => {
  return useQuery({
    queryKey: ["language-model-session"],
    queryFn: async (): Promise<LanguageModel> => {
      const availability = await LanguageModel.availability();
      if (availability === "unavailable")
        throw new Error("Modèle indisponible.");
      return new Promise((resolve, reject) => {
        LanguageModel.create({
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              console.log("Download progress:", e.loaded);
            });
          },
        })
          .then(resolve)
          .catch(reject);
      });
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};
