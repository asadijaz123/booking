export const updateSeatSelection = async (
   backendHost: string,
   props: UpdateSelectionRequestBody
) => {
   try {
      const res = await fetch(`${backendHost}/api/plan/update-selection`, {
         body: JSON.stringify(props),
         method: "POST",
         headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      return data;
   } catch (err: any) {
      return JSON.parse(err);
   }
};
export const updateZoneSelection = async (
   backendHost: string,
   props: UpdateSelectionRequestBody
) => {
   try {
      const res = await fetch(`${backendHost}/api/plan/update-selection`, {
         body: JSON.stringify(props),
         method: "POST",
         headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      return data;
   } catch (err: any) {
      return JSON.parse(err);
   }
};

export const getSelectionData = async (backendHost: string, planId: string) => {
   const res = await fetch(`${backendHost}/api/plan/selections/${planId}`, {
      headers: { "Content-Type": "application/json" },
   });
   const data = await res.json();
   return data;
};
