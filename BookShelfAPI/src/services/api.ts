// src/services/api.ts
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Book, GoogleBooksApiResponse } from '../types/Books';

// Usando a variável de ambiente como configuramos
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const identifyTextFromImage = async (imageUri: string): Promise<string | null> => {
  const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`;
  try {
    const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const requestBody = {
      requests: [
        {
          image: {
            content: base64ImageData,
          },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    };

    const response = await axios.post(visionApiUrl, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const textAnnotations = response.data.responses[0]?.textAnnotations;
    if (textAnnotations && textAnnotations.length > 0) {
      return textAnnotations[0].description.replace(/\n/g, ' ');
    }
    
    return null;
  } catch (error: any) {
    if (error.response) console.error('Erro na API do Google Vision - Data:', error.response.data);
    throw new Error('Não foi possível analisar a imagem.');
  }
};

export const fetchBookDetails = async (query: string): Promise<Book[] | null> => {
  const booksApiUrl = `https://www.googleapis.com/books/v1/volumes`;
  try {
    const response = await axios.get<GoogleBooksApiResponse>(booksApiUrl, {
      params: {
        key: GOOGLE_API_KEY,
        q: query,
        maxResults: 5,
        langRestrict: 'pt', // ✅ Restringindo a busca para Português
      },
    });

    if (response.data && response.data.items) {
      return response.data.items;
    }
    
    return null;
  } catch (error) {
    console.error('Erro na API do Google Books:', error);
    throw new Error('Não foi possível buscar os detalhes do livro.');
  }
};