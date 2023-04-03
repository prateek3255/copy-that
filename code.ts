// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true, width: 352, height: 260 });

const selectedNodes = figma.currentPage.selection;
if (selectedNodes.length === 1 && selectedNodes[0].type === "TEXT") {
  const text = selectedNodes[0].characters;
  figma.ui.postMessage({
    type: "initialize-text",
    text,
  });
}

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "generate-suggestions") {
    const selectedNodes = figma.currentPage.selection;
    if (selectedNodes.length === 1 && selectedNodes[0].type === "TEXT") {
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + "API_KEY",
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: `Given a certain text perform action on it based on type provided:\n\nText: Im really excited about the upcomng conference. Ive been working on my presentation for weeks and I think its going to be great! Theirs going to be a lot of important people there and I want to make a good impression.\n\nType: Proofread\n\nOutput: I'm really excited about the upcoming conference. I've been working on my presentation for weeks, and I think it's going to be great! There's going to be a lot of important people there, and I want to make a good impression.\n\n---\n\nText: The Lamborghini Aventador is a mid-engine sportscar produced by the Italian automotive manufacturer Lamborghini. In keeping with Lamborghini tradition, the Aventador is named after a Spanish fighting bull that fought in Zaragoza, Aragón, in 1993.\n\nType: Make it longer\n\nOutput:\n- The Lamborghini Aventador is an exquisite mid-engine sports car which boasts sleek lines and an aggressively styled exterior. It's produced by the legendary Italian automotive manufacturer Lamborghini, a brand that has long been synonymous with luxury, power, and performance. The car is named after a Spanish fighting bull that made headlines in 1993 for its valiant and ferocious battle in Zaragoza, Aragón. The Aventador carries on the legacy of this fighting spirit with its powerful engine and impressive performance capabilities that are sure to leave drivers and onlookers in awe.\n\n - When it comes to high-end sports cars, few can match the sheer power and beauty of the Lamborghini Aventador. This mid-engine marvel is the product of years of research and development by the experts at Lamborghini, a company that has long been at the forefront of automotive innovation. The Aventador is named after a legendary Spanish fighting bull that rose to fame in Zaragoza, Aragón, in 1993. The car's name is a fitting tribute to the animal's fierce spirit and tenacity, which are mirrored in the Aventador's stunning design and impressive performance features. \n\n- For many people, the Lamborghini Aventador is the ultimate expression of automotive luxury and performance. This mid-engine sports car is the brainchild of Lamborghini, one of the world's most renowned and respected car manufacturers. The Aventador is named after a Spanish fighting bull that captured the hearts and minds of spectators in Zaragoza, Aragón, in 1993. Like the bull, the Aventador is a force to be reckoned with, boasting impressive power and speed, making it a true standout in the sports car world. From its sleek exterior to its meticulously crafted interior, the Aventador is a car that represents the very best in automotive engineering and design.\n\n---\n\nText: macOS (previously OS X and originally Mac OS X) is a Unix operating system[8] developed and marketed by Apple Inc. since 2001. It is the primary operating system for Apple's Mac computers. Within the market of desktop and laptop computers it is the second most widely used desktop OS, after Microsoft Windows and ahead of ChromeOS.\n\nType: Make it shorter\n\nOutput:\n- macOS is a Unix OS by Apple for Macs, second to Windows in desktop/laptop market share.\n\n- Developed by Apple since 2001, macOS is a Unix OS for Macs, ranked 2nd in desktop/laptop market.\n\n- Apple's macOS is a Unix OS for Macs, the 2nd most popular desktop/laptop OS after Windows.\n\n---\n\nText: ${msg.text}\n\nType: ${msg.purpose}\n\nOutput:}`,
          temperature: 0.51,
          max_tokens: 3068,
          top_p: 0.5,
          frequency_penalty: 0.35,
          presence_penalty: 0.14,
        }),
      });
      const data = await response.json();
      const output = data.choices[0]?.text;
      const allOutputs = output
        .split("\n- ")
        .filter((item: string) => item.trim() !== "");
      figma.ui.resize(352, 380);

      figma.ui.postMessage({
        type: "update-suggestions",
        suggestions: allOutputs,
      });
    }
  }

  if (msg.type === "replace-text") {
    const selectedNodes = figma.currentPage.selection;
    if (selectedNodes.length === 1 && selectedNodes[0].type === "TEXT") {
      const fontName = selectedNodes[0].getRangeFontName(0, 1);
      await figma.loadFontAsync(fontName as FontName);
      selectedNodes[0].deleteCharacters(0, selectedNodes[0].characters.length);
      selectedNodes[0].insertCharacters(0, msg.text);
    }
    figma.closePlugin();
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
};
