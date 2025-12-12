import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Spin, Button, Alert } from 'antd';
import type { ChannelData } from '../../types/channel';
import { analyzeChannel, type DeepSeekAnalysis } from '../../services/deepseekApi';
import './AIAnalysis.scss';

interface AIAnalysisProps {
  channel: ChannelData | null;
}

export default function AIAnalysis({ channel }: AIAnalysisProps) {
  const { t, i18n } = useTranslation();
  const [analysis, setAnalysis] = useState<DeepSeekAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!channel) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);
    
    const hide = message.loading(t('ai.analyzingText'), 0);

    try {
      const result = await analyzeChannel({
        name: channel.name,
        length: channel.length,
        width: channel.width,
        depth: channel.depth,
        waterFlow: channel.waterFlow,
        waterVolumeIn: channel.waterVolumeIn,
        waterVolumeOut: channel.waterVolumeOut,
        lossPercentage: channel.lossPercentage,
        lossPerKm: channel.lossPerKm,
        efficiency: channel.efficiency,
        status: channel.status,
      }, i18n.language);
      setAnalysis(result);
      hide();
      message.success(t('ai.analyze') + ' - ' + t('ai.analyzing') + ' ' + t('ai.analyzingText'));
    } catch (err) {
      hide();
      const errorMsg = err instanceof Error ? err.message : 'Ошибка при анализе канала';
      setError(errorMsg);
      message.error(errorMsg);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!channel) {
    return (
      <div className="ai-analysis empty">
        <p>{t('ai.selectChannel')}</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      default:
        return '#10b981';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'Критический';
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      default:
        return 'Низкий';
    }
  };

  return (
    <div className="ai-analysis">
      <div className="ai-header">
        <h3>🤖 {t('ai.title')}</h3>
        <p className="ai-description">
          {t('ai.description')}
        </p>
        <Button
          type="primary"
          size="large"
          onClick={handleAnalyze}
          loading={loading}
        >
          {t('ai.analyze')}
        </Button>
      </div>

      {error && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      {loading && (
        <div className="loading-state">
          <Spin size="large" tip={t('ai.analyzingText')} />
        </div>
      )}

      {analysis && (
        <div className="analysis-result">
          <div className="priority-badge" style={{ borderColor: getPriorityColor(analysis.priority) }}>
            <span className="priority-label">{t('ai.priority')}:</span>
            <span className="priority-value" style={{ color: getPriorityColor(analysis.priority) }}>
              {getPriorityLabel(analysis.priority)}
            </span>
          </div>

          <div className="analysis-content">
            <h4>{t('ai.analysis')}</h4>
            <div className="analysis-text">
              {analysis.analysis.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="recommendations-section">
              <h4>{t('ai.recommendations')}</h4>
              <ul className="recommendations-list">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

