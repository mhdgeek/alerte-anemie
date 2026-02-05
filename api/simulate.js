// api/simulate.js - API de simulation (backup)

export default async function handler(req, res) {
    // Configurer CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { profile, symptoms } = req.body;

        console.log('🔧 Simulation d\'analyse pour:', { profile, symptoms: symptoms?.length });

        // Simulation simple mais réaliste
        const symptomCount = symptoms?.length || 0;
        
        let baseRisk;
        if (symptomCount === 0) baseRisk = 0.2;
        else if (symptomCount <= 2) baseRisk = 0.4;
        else if (symptomCount <= 4) baseRisk = 0.6;
        else baseRisk = 0.8;

        // Ajuster selon le profil
        const profileFactors = {
            'parent': 0.9,
            'health-agent': 1.0,
            'teenager': 1.1,
            'adult': 1.0
        };

        const adjustedRisk = baseRisk * (profileFactors[profile] || 1.0);

        // Déterminer le niveau de risque
        let riskLevel, confidence;
        if (adjustedRisk < 0.3) {
            riskLevel = 'low';
            confidence = 80 + Math.floor(Math.random() * 15);
        } else if (adjustedRisk < 0.6) {
            riskLevel = 'medium';
            confidence = 70 + Math.floor(Math.random() * 20);
        } else {
            riskLevel = 'high';
            confidence = 75 + Math.floor(Math.random() * 20);
        }

        // Générer des détails réalistes
        const details = generateSimulationDetails(profile, symptoms, riskLevel);

        const response = {
            risk_level: riskLevel,
            confidence: confidence,
            details: details,
            timestamp: new Date().toISOString(),
            simulated: true,
            profile: profile,
            symptoms_count: symptomCount,
            risk_score: Math.round(adjustedRisk * 100) / 100
        };

        console.log('✅ Simulation terminée:', { riskLevel, confidence });

        return res.status(200).json(response);

    } catch (error) {
        console.error('❌ Erreur de simulation:', error);
        return res.status(500).json({ 
            error: 'Erreur de simulation',
            message: error.message
        });
    }
}

function generateSimulationDetails(profile, symptoms, riskLevel) {
    const profileNames = {
        'parent': 'parent',
        'health-agent': 'agent de santé',
        'teenager': 'adolescent',
        'adult': 'adulte'
    };

    const symptomCount = symptoms?.length || 0;
    const profileName = profileNames[profile] || 'utilisateur';

    const details = [
        `Analyse pour ${profileName}`,
        `${symptomCount} symptôme(s) pris en compte`
    ];

    if (riskLevel === 'low') {
        details.push("Faible probabilité d'anémie détectée");
    } else if (riskLevel === 'medium') {
        details.push("Risque modéré nécessitant une surveillance");
    } else {
        details.push("Risque élevé - consultation recommandée");
    }

    return details.join(' | ');
}