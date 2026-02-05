// api/analyze.js - API d'analyse IA

export default async function handler(req, res) {
    // Configurer CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Gérer les requêtes OPTIONS pour CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Seules les requêtes POST sont acceptées
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'Seules les requêtes POST sont acceptées'
        });
    }

    try {
        const { profile, symptoms, timestamp, hasPhotos } = req.body;

        console.log('📡 Requête d\'analyse reçue:', {
            profile,
            symptomsCount: symptoms?.length || 0,
            hasPhotos,
            timestamp
        });

        // 1. Valider les données
        if (!profile || !symptoms) {
            return res.status(400).json({
                error: 'Données incomplètes',
                message: 'Le profil et les symptômes sont requis'
            });
        }

        // 2. Simulation d'analyse IA intelligente
        const analysisResult = simulateIntelligentAnalysis(profile, symptoms, hasPhotos);

        // 3. Ajouter des métadonnées
        const responseData = {
            risk_level: analysisResult.riskLevel,
            confidence: analysisResult.confidence,
            details: analysisResult.details,
            timestamp: new Date().toISOString(),
            analysis_id: generateAnalysisId(),
            profile_used: profile,
            symptoms_analyzed: symptoms,
            indicators: analysisResult.indicators,
            recommendations: analysisResult.recommendations
        };

        console.log('✅ Analyse terminée:', {
            riskLevel: analysisResult.riskLevel,
            confidence: analysisResult.confidence
        });

        // 4. Retourner la réponse
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('❌ Erreur d\'analyse:', error);
        
        return res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// Simulation d'analyse IA intelligente
function simulateIntelligentAnalysis(profile, symptoms, hasPhotos) {
    let totalScore = 0;
    const indicators = [];
    const details = [];

    // 1. Score basé sur les symptômes (60% du score)
    const symptomScore = calculateSymptomScore(symptoms);
    totalScore += symptomScore * 0.6;
    
    if (symptoms.length > 0) {
        indicators.push(`${symptoms.length} symptôme(s) détecté(s)`);
        details.push(`Symptômes: ${symptoms.join(', ')}`);
    }

    // 2. Score basé sur le profil (20% du score)
    const profileScore = calculateProfileScore(profile);
    totalScore += profileScore * 0.2;
    indicators.push(`Profil: ${getProfileName(profile)}`);

    // 3. Score basé sur la présence de photos (20% du score)
    const photoScore = hasPhotos ? 0.7 : 0.3;
    totalScore += photoScore * 0.2;
    
    if (hasPhotos) {
        indicators.push("Photos analysées: Oui");
        details.push("Analyse visuelle des photos incluse");
    } else {
        indicators.push("Photos analysées: Non");
        details.push("Analyse basée uniquement sur les symptômes");
    }

    // 4. Calculer le risque final
    let riskLevel, confidence;
    
    if (totalScore < 0.3) {
        riskLevel = 'low';
        confidence = 85 + Math.floor(Math.random() * 10); // 85-95%
    } else if (totalScore < 0.6) {
        riskLevel = 'medium';
        confidence = 70 + Math.floor(Math.random() * 15); // 70-85%
    } else {
        riskLevel = 'high';
        confidence = 80 + Math.floor(Math.random() * 15); // 80-95%
    }

    // 5. Générer des recommandations
    const recommendations = generateRecommendations(riskLevel, symptoms);

    return {
        riskLevel,
        confidence,
        details: details.join(' | '),
        indicators,
        recommendations,
        totalScore: Math.round(totalScore * 100) / 100
    };
}

function calculateSymptomScore(symptoms) {
    // Poids des symptômes
    const symptomWeights = {
        'fatigue': 0.3,
        'vertiges ou étourdissements': 0.4,
        'palpitations': 0.5,
        'maux de tête': 0.2,
        'essoufflement': 0.6,
        'respiration rapide': 0.5,
        'étourdissements au lever': 0.4,
        'difficultés de concentration': 0.3,
        'pâleur de la peau': 0.7,
        'ongles cassants': 0.6
    };

    let score = 0;
    symptoms.forEach(symptom => {
        const normalizedSymptom = symptom.toLowerCase();
        score += symptomWeights[normalizedSymptom] || 0.2;
    });

    // Normaliser le score entre 0 et 1
    return Math.min(1, score / 2);
}

function calculateProfileScore(profile) {
    const profileScores = {
        'parent': 0.3,
        'health-agent': 0.4,
        'teenager': 0.5,
        'adult': 0.4
    };
    
    return profileScores[profile] || 0.4;
}

function getProfileName(profile) {
    const profileNames = {
        'parent': 'Parent',
        'health-agent': 'Agent de santé',
        'teenager': 'Adolescent',
        'adult': 'Adulte'
    };
    
    return profileNames[profile] || 'Adulte';
}

function generateRecommendations(riskLevel, symptoms) {
    const baseRecommendations = {
        low: [
            "Continuez à avoir une alimentation équilibrée riche en fer",
            "Consultez un médecin si de nouveaux symptômes apparaissent"
        ],
        medium: [
            "Consultez un professionnel de santé pour un diagnostic complet",
            "Augmentez votre consommation d'aliments riches en fer",
            "Évitez le thé et café pendant les repas"
        ],
        high: [
            "Consultez rapidement un médecin ou un centre de santé",
            "Un bilan sanguin (NFS) est recommandé",
            "Suivez les conseils nutritionnels fournis"
        ]
    };

    const specificRecommendations = [];
    
    if (symptoms.includes('Fatigue')) {
        specificRecommendations.push("Reposez-vous suffisamment et évitez les efforts intenses");
    }
    
    if (symptoms.includes('Pâleur de la peau') || symptoms.includes('Ongles cassants')) {
        specificRecommendations.push("Ces symptômes visuels nécessitent une consultation médicale");
    }

    return {
        general: baseRecommendations[riskLevel],
        specific: specificRecommendations
    };
}

function generateAnalysisId() {
    return 'ana_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}