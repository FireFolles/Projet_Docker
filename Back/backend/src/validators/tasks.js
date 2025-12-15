function validateDescription(rawDescription) {
  if (typeof rawDescription !== "string") {
    return { error: "Le champ description est requis." };
  }

  const description = rawDescription.trim();
  if (!description) {
    return { error: "La description ne peut pas être vide." };
  }
  if (description.length > 255) {
    return { error: "La description doit contenir 255 caractères maximum." };
  }

  return { value: description };
}

function validateCompleted(rawCompleted) {
  if (typeof rawCompleted !== "boolean") {
    return { error: "Le champ completed doit être un booléen." };
  }
  return { value: rawCompleted };
}

function validateId(rawId) {
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (typeof rawId !== "string" || !UUID_REGEX.test(rawId)) {
    return { error: "Identifiant invalide." };
  }
  return { value: rawId };
}

module.exports = {
  validateDescription,
  validateCompleted,
  validateId,
};

