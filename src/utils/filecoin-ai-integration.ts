/**
 * Filecoin AI Integration Service
 * Handles biometric data processing and Filecoin storage integration
 */

// import { Web3Storage } from 'web3.storage'; // Module available but TypeScript declaration issue
import { WalletConnection } from 'near-api-js';

export interface BiometricData {
  eeg?: number[];
  heartRate?: number[];
  emotions?: Array<{
    valence: number;
    arousal: number;
    dominance: number;
    confidence: number;
  }>;
  facial?: Array<{
    landmarks: number[][];
    emotions: string[];
  }>;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  biometric_hash: string;
  emotion_vector: {
    valence: number;
    arousal: number;
    dominance: number;
  };
  ai_model: string;
  created_at: string;
}

export class FilecoinAIIntegration {
  private web3Storage: any | null = null; // Web3Storage | null = null;
  // private walletConnection: WalletConnection | null = null; // Available but not used yet

  constructor(web3StorageToken?: string) {
    if (web3StorageToken) {
      // this.web3Storage = new Web3Storage({ token: web3StorageToken });
      console.log('Web3Storage token provided:', web3StorageToken);
    }
  }

  // setWalletConnection(walletConnection: WalletConnection) {
  //   this.walletConnection = walletConnection;
  // }

  /**
   * Process biometric data and create NFT metadata
   */
  async processBiometricNFT(
    biometricData: BiometricData,
    title: string,
    description: string,
    aiModel: string = 'emotion_analyzer_v2'
  ): Promise<{ metadata: NFTMetadata; features: number[] }> {
    try {
      // Extract features from biometric data
      const features = this.extractBiometricFeatures(biometricData);
      
      // Generate emotion vector
      const emotionVector = this.calculateEmotionVector(biometricData);
      
      // Generate biometric hash
      const biometricHash = this.generateBiometricHash(biometricData);
      
      // Create metadata
      const metadata: NFTMetadata = {
        name: title,
        description: description,
        image: '', // Will be set by image generation service
        attributes: [
          { trait_type: 'Biometric Hash', value: biometricHash },
          { trait_type: 'AI Model', value: aiModel },
          { trait_type: 'Valence', value: emotionVector.valence },
          { trait_type: 'Arousal', value: emotionVector.arousal },
          { trait_type: 'Dominance', value: emotionVector.dominance }
        ],
        biometric_hash: biometricHash,
        emotion_vector: emotionVector,
        ai_model: aiModel,
        created_at: new Date().toISOString()
      };

      return { metadata, features };
    } catch (error) {
      console.error('Error processing biometric NFT:', error);
      throw new Error('Failed to process biometric data');
    }
  }

  /**
   * Extract features from biometric data
   */
  private extractBiometricFeatures(biometricData: BiometricData): number[] {
    const features: number[] = [];

    // EEG features (if available)
    if (biometricData.eeg && biometricData.eeg.length > 0) {
      const eeg = biometricData.eeg;
      features.push(
        this.calculateAverage(eeg),
        this.calculateVariance(eeg),
        Math.max(...eeg) - Math.min(...eeg), // Range
        this.calculateDominantFrequency(eeg)
      );
    } else {
      features.push(0, 0, 0, 0); // Placeholder features
    }

    return features;
  }

  /**
   * Calculate emotion vector from biometric data
   */
  private calculateEmotionVector(biometricData: BiometricData): { valence: number; arousal: number; dominance: number } {
    if (biometricData.emotions && biometricData.emotions.length > 0) {
      const latest = biometricData.emotions[biometricData.emotions.length - 1];
      return {
        valence: latest.valence,
        arousal: latest.arousal,
        dominance: latest.dominance
      };
    }

    // Default neutral emotion
    return { valence: 0.5, arousal: 0.5, dominance: 0.5 };
  }

  /**
   * Generate biometric hash from session data
   */
  private generateBiometricHash(biometricData: BiometricData): string {
    const dataString = JSON.stringify({
      eeg: biometricData.eeg?.slice(0, 100), // First 100 samples
      heartRate: biometricData.heartRate?.slice(0, 100),
      emotions: biometricData.emotions?.slice(0, 10),
      timestamp: Date.now()
    });
    
    // Simple hash function (in production, use proper cryptographic hash)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `biometric_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Calculate average of array
   */
  private calculateAverage(data: number[]): number {
    if (data.length === 0) return 0;
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  /**
   * Calculate variance of array
   */
  private calculateVariance(data: number[]): number {
    if (data.length === 0) return 0;
    const mean = this.calculateAverage(data);
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  }

  /**
   * Calculate RMSSD (Root Mean Square of Successive Differences)
   * Available for future heart rate variability analysis
   */
  private calculateRMSSD(data: number[]): number {
    if (data.length < 2) return 0;
    
    let sum = 0;
    for (let i = 1; i < data.length; i++) {
      const diff = data[i] - data[i - 1];
      sum += diff * diff;
    }
    
    return Math.sqrt(sum / (data.length - 1));
  }

  /**
   * Calculate dominant frequency (simplified)
   */
  private calculateDominantFrequency(data: number[]): number {
    // Simplified implementation - in reality would use FFT
    return this.calculateAverage(data) * 0.1;
  }

  /**
   * Store metadata on Filecoin via Web3.Storage
   */
  async storeOnFilecoin(metadata: NFTMetadata): Promise<string> {
    if (!this.web3Storage) {
      throw new Error('Web3.Storage not initialized');
    }

    try {
      const metadataJson = JSON.stringify(metadata, null, 2);
      const blob = new Blob([metadataJson], { type: 'application/json' });
      const file = new File([blob], `metadata_${Date.now()}.json`, { type: 'application/json' });
      
      const cid = await this.web3Storage.put([file]);
      return cid.toString();
    } catch (error) {
      console.error('Error storing on Filecoin:', error);
      throw new Error('Failed to store metadata on Filecoin');
    }
  }

  /**
   * Retrieve metadata from Filecoin
   */
  async retrieveFromFilecoin(cid: string): Promise<NFTMetadata> {
    if (!this.web3Storage) {
      throw new Error('Web3.Storage not initialized');
    }

    try {
      const res = await this.web3Storage.get(cid);
      if (!res.ok) {
        throw new Error(`Failed to get ${cid}`);
      }

      const files = await res.files();
      if (files.length === 0) {
        throw new Error('No files found');
      }

      const text = await files[0].text();
      return JSON.parse(text) as NFTMetadata;
    } catch (error) {
      console.error('Error retrieving from Filecoin:', error);
      throw new Error('Failed to retrieve metadata from Filecoin');
    }
  }

  /**
   * Generate creative recommendations based on biometric data
   */
  async getCreativeRecommendations(userId: string, biometricData: BiometricData): Promise<any[]> {
    try {
      const emotionVector = this.calculateEmotionVector(biometricData);
      
      // Generate recommendations based on emotion vector
      const recommendations = [
        {
          type: 'color_palette',
          recommendation: this.getColorPaletteForEmotion(emotionVector),
          confidence: 0.8
        },
        {
          type: 'art_style',
          recommendation: this.getArtStyleForEmotion(emotionVector),
          confidence: 0.7
        },
        {
          type: 'composition',
          recommendation: this.getCompositionForEmotion(emotionVector),
          confidence: 0.6
        }
      ];

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Get color palette for emotion
   */
  private getColorPaletteForEmotion(emotion: { valence: number; arousal: number; dominance: number }): string[] {
    if (emotion.valence > 0.7) {
      return ['#FFD700', '#FF6B6B', '#4ECDC4']; // Happy - warm colors
    } else if (emotion.valence < 0.3) {
      return ['#2C3E50', '#34495E', '#8E44AD']; // Sad - cool colors
    } else {
      return ['#95A5A6', '#7F8C8D', '#BDC3C7']; // Neutral - gray tones
    }
  }

  /**
   * Get art style for emotion
   */
  private getArtStyleForEmotion(emotion: { valence: number; arousal: number; dominance: number }): string {
    if (emotion.arousal > 0.7) {
      return 'abstract_expressionism';
    } else if (emotion.dominance > 0.7) {
      return 'bold_geometric';
    } else {
      return 'soft_impressionism';
    }
  }

  /**
   * Get composition for emotion
   */
  private getCompositionForEmotion(emotion: { valence: number; arousal: number; dominance: number }): string {
    if (emotion.dominance > 0.7) {
      return 'symmetrical_balanced';
    } else if (emotion.arousal > 0.7) {
      return 'dynamic_diagonal';
    } else {
      return 'centered_focus';
    }
  }
}

export default FilecoinAIIntegration;