/** @type {import('tailwindcss').Config} */
module.exports = {
   content: ["./src/**/*.html", "./src/**/*.tsx"],
   theme: {
      extend: {
         fontFamily: {
            raleway: "Raleway",
         },
         colors: {
            gray: {
               200: "rgb(241, 240, 240)",

               250: "rgba(218, 218, 218, 1)",
               square: "rgba(195, 195, 195, 1)",
               300: "rgba(153, 153, 153, 1)",
               400: "rgba(108, 108, 108, 1)",
               500: "rgba(90, 90, 90, 1)",

               light: "rgb(241, 240, 240)",
               normal: "rgb(116, 116, 116)",
            },
            error: {
               500: "rgba(255, 68, 68, 1)",
               300: "rgba(233, 140, 140, 1)",
            },
            orange: { 500: "rgba(255, 153, 33, 1)" },
            blue: { main: "#0000CC", 300: "#A2A2FF" },
            purple: { main: "#6777CC", bright: "rgba(93, 119, 255, 1)" },
            "icon-enabled": "#5A5A5A",

            "icon-disabled": "#C8C2C2",
         },
         fontSize: {
            "10px": 10 / 16 + "rem",
            xxs: "0.5rem",
            "2xs": "0.4rem",
         },
         boxShadow: {
            sm: "0 2px 4px 0 rgba(0, 0, 0, 0.25)",
            badge: "0px 3.6px 7.2px 0px rgba(0, 0, 0, 0.25)",
         },

         minHeight: { 0.25: "0.0625rem" },
         spacing: {
            0.25: "0.0625rem",
            0.75: "0.1875rem",
            5.5: "1.375rem",
            4.5: "1.125rem",
            7.5: "1.875rem",
         },
         borderRadius: {
            "sm-md": "0.3125rem",
            "10px": "0.625rem",
         },
      },
   },
   plugins: [],
};
