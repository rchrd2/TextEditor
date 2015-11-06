/**  for now redundant */

/* Define a collection, but will only use one document. */
Data = new Mongo.Collection("Data");

/* Important, do not change DATA_ID or else all apps will lose their data */
DATA_ID = "default_id";

/* The default CSS for new documents */
DEFAULT_CSS_FONT_SIZE = "16px";
DEFAULT_CSS_FONT_FAMILY = "Menlo, monospace";
DEFAULT_CSS = `font-family: ${DEFAULT_CSS_FONT_FAMILY};
font-size: ${DEFAULT_CSS_FONT_SIZE};
background-color: #FFFFFF;
color: #000000;
`;

/* end redundant */

Meteor.startup(function () {
  /* Subscribe to the document */
  Meteor.subscribe("thedocument");
});
