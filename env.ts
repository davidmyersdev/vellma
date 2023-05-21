export const env = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  const organization = import.meta.env.VITE_OPENAI_ORGANIZATION
  const userId = import.meta.env.VITE_OPENAI_USER_ID

  return {
    apiKey,
    organization,
    userId,
  }
}