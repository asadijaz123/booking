export const updateSeatBlocking = async (
   backendHost: string,
   props: UpdateSeatBlockingRequestBody
) => {
   try {
      const res = await fetch(`${backendHost}/api/plan/update-seat-blocking`, {
         body: JSON.stringify(props),
         method: "POST",
         headers: { "Content-Type": "application/json" },
      });
      return res;
   } catch (err: any) {
      return JSON.parse(err);
   }
};
