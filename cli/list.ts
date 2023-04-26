import { api } from '../src/api'

const apiClient = api()
const response = await apiClient.listModels()

console.log(response.data)
