import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Naviagation';
import { identifyTextFromImage, fetchBookDetails } from '../services/api';
import { Book } from '../types/Books';

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

export default function ResultScreen() {
  const route = useRoute<ResultScreenRouteProp>();
  const { imageUri } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Processando imagem...');
  const [error, setError] = useState<string | null>(null);
  const [foundBook, setFoundBook] = useState<Book | null>(null);

  useEffect(() => {
    const processBookRecognition = async () => {
      try {
        setStatusMessage('Analisando a capa do livro...');
        const identifiedText = await identifyTextFromImage(imageUri);

        if (!identifiedText) {
          throw new Error('Nenhum texto foi encontrado na capa. Tente uma foto com mais luz e foco.');
        }

        
         const cleanedText = identifiedText
          .replace(/[^a-zA-Z\s]/g, " ")
          .split(' ')
          .filter(word => word.length > 3)
          .join(' ');


        console.log('Texto limpo para busca:', cleanedText); 

        setStatusMessage(`Buscando por "${cleanedText.substring(0, 20)}..."`);
        const books = await fetchBookDetails(cleanedText); 

        if (!books || books.length === 0) {
          throw new Error('Nenhum livro encontrado com este título. Tente outra capa.');
        }
        
        setFoundBook(books[0]);
        setError(null);

      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro desconhecido.');
        setFoundBook(null);
      } finally {
        setIsLoading(false);
      }
    };

    processBookRecognition();
  }, [imageUri]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ops! Algo deu errado.</Text>
        <Text style={styles.errorDetails}>{error}</Text>
      </View>
    );
  }

  if (foundBook) {
    const { volumeInfo } = foundBook;
    const coverImage = volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192.png?text=No+Cover';
    
    return (
      <ScrollView contentContainerStyle={styles.bookContainer}>
        <Image source={{ uri: coverImage }} style={styles.coverImage} />
        <Text style={styles.title}>{volumeInfo.title}</Text>
        <Text style={styles.authors}>{volumeInfo.authors?.join(', ')}</Text>
        <Text style={styles.pageCount}>{volumeInfo.pageCount} páginas</Text>
        <Text style={styles.description}>{volumeInfo.description}</Text>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>Nenhum livro foi encontrado.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f4f4f4' },
  statusText: { marginTop: 15, fontSize: 16, color: '#666' },
  errorText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  errorDetails: { fontSize: 16, color: '#e74c3c', textAlign: 'center', marginTop: 10 },
  bookContainer: { alignItems: 'center', padding: 20 },
  coverImage: { width: 150, height: 220, resizeMode: 'contain', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  authors: { fontSize: 18, color: '#555', marginBottom: 15 },
  pageCount: { fontSize: 16, color: '#888', marginBottom: 20 },
  description: { fontSize: 16, color: '#333', textAlign: 'justify' },
});