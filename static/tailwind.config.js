/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["../templates/*.html", "../templates/*.js"],
  theme: {
    fontFamily:{
      'libre':['"Libre Franklin"', 'sans-serif']
    },
    extend:{
      colors:{
        'yellow':'#f9df6d',
        'green':'#a0c35a',
        'blue':'#b0c4ef',
        'purple':'#ba81c5'
      }
    }
  },
}

