
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { WinnerConfiguration, AwardCategory, ProblemStatement, AwardLevel } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Icons } from '../../constants';
import Alert from '../ui/Alert';

const WinnerConfigurationForm: React.FC = () => {
  const { getCurrentHackathon, updateCurrentWinnerConfiguration } = useAppContext();
  const currentHackathon = getCurrentHackathon();

  const [config, setConfig] = useState<WinnerConfiguration | null>(null);
  const [initialProblemStatements, setInitialProblemStatements] = useState<ProblemStatement[]>([]);


  useEffect(() => {
    if (currentHackathon) {
      setConfig(currentHackathon.data.winnerConfiguration || { scope: 'overall', awardCategories: [] });
      setInitialProblemStatements(currentHackathon.data.problemStatements);
    } else {
      setConfig(null);
      setInitialProblemStatements([]);
    }
  }, [currentHackathon]);

  const updateAwardCategoriesBasedOnScopeAndProblems = useCallback(() => {
    if (!config || !currentHackathon) return;

    let newAwardCategories: AwardCategory[] = [];
    if (config.scope === 'overall') {
      const existingOverall = config.awardCategories.find(ac => ac.id === 'overall');
      newAwardCategories = [{
        id: 'overall',
        name: 'Overall Event',
        allowedLevels: existingOverall?.allowedLevels || ['winner', 'runner_up', 'second_runner_up']
      }];
    } else if (config.scope === 'per_problem_statement') {
      newAwardCategories = initialProblemStatements.map(ps => {
        const existingCategory = config.awardCategories.find(ac => ac.id === ps.id);
        return {
          id: ps.id,
          name: ps.title,
          allowedLevels: existingCategory?.allowedLevels || (['winner'] as AwardLevel[]) // Default to just winner for new PS categories
        };
      });
    }
    setConfig(prevConfig => prevConfig ? { ...prevConfig, awardCategories: newAwardCategories } : null);
  }, [config, currentHackathon, initialProblemStatements]);


  useEffect(() => {
    // This effect runs when scope changes or when problem statements (initialProblemStatements) might change.
    // However, if problem statements are modified externally AFTER this component loads,
    // this specific effect won't pick up those changes unless initialProblemStatements is re-derived from context directly here
    // or passed down reactively. For now, it initializes based on problem statements at load time.
    if (config?.scope && currentHackathon) {
        // If config exists, check if categories align with current problem statements if scope is 'per_problem_statement'
        if (config.scope === 'per_problem_statement') {
            const currentPsIds = currentHackathon.data.problemStatements.map(ps => ps.id);
            // const categoryIds = config.awardCategories.map(cat => cat.id); // Not directly used, can remove

            const newCategories = currentHackathon.data.problemStatements.map(ps => {
                const existing = config.awardCategories.find(cat => cat.id === ps.id);
                return existing || { id: ps.id, name: ps.title, allowedLevels: ['winner'] as AwardLevel[] };
            });
            // Filter out categories for deleted problem statements
            const filteredCategories = newCategories.filter(cat => currentPsIds.includes(cat.id));
            
            if (JSON.stringify(filteredCategories) !== JSON.stringify(config.awardCategories)) {
                 setConfig(prev => prev ? { ...prev, awardCategories: filteredCategories } : null);
            }
        } else if (config.scope === 'overall' && (config.awardCategories.length !== 1 || config.awardCategories[0].id !== 'overall')) {
             setConfig(prev => prev ? { ...prev, awardCategories: [{ id: 'overall', name: 'Overall Event', allowedLevels: prev.awardCategories.find(ac => ac.id === 'overall')?.allowedLevels || (['winner', 'runner_up', 'second_runner_up'] as AwardLevel[]) }] } : null);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.scope, currentHackathon, config?.awardCategories]);


  const handleScopeChange = (scope: WinnerConfiguration['scope']) => {
    if (!config) return;
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig: WinnerConfiguration = { ...prevConfig, scope };
      if (scope === 'overall') {
        newConfig.awardCategories = [{ id: 'overall', name: 'Overall Event', allowedLevels: ['winner', 'runner_up', 'second_runner_up'] as AwardLevel[] }];
      } else {
        newConfig.awardCategories = currentHackathon?.data.problemStatements.map(ps => ({
          id: ps.id,
          name: ps.title,
          allowedLevels: ['winner'] as AwardLevel[]
        })) || [];
      }
      return newConfig;
    });
  };

  const handleLevelChange = (categoryId: string, level: AwardLevel, checked: boolean) => {
    if (!config) return;
    const updatedCategories = config.awardCategories.map(cat => {
      if (cat.id === categoryId) {
        const newLevels = checked
          ? [...cat.allowedLevels, level]
          : cat.allowedLevels.filter(l => l !== level);
        // Ensure unique levels and specific order if desired (optional)
        const uniqueLevels = Array.from(new Set(newLevels));
        const order: AwardLevel[] = ['winner', 'runner_up', 'second_runner_up'];
        uniqueLevels.sort((a, b) => order.indexOf(a) - order.indexOf(b));
        return { ...cat, allowedLevels: uniqueLevels };
      }
      return cat;
    });
    setConfig(prevConfig => prevConfig ? { ...prevConfig, awardCategories: updatedCategories } : null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !currentHackathon) {
      alert("No configuration or hackathon data to save.");
      return;
    }
    // Validate: At least one level must be selected for each category
    const isValid = config.awardCategories.every(cat => cat.allowedLevels.length > 0);
    if (!isValid) {
        alert("Each award category must have at least one award level (e.g., Winner) selected.");
        return;
    }
    updateCurrentWinnerConfiguration(config);
    alert(`Award configuration for "${currentHackathon.data.title}" updated!`);
  };

  if (!currentHackathon) {
    return (
      <Card title="Award Configuration">
        <Alert type="info" message="No hackathon selected. Please choose one from the Admin dashboard." />
      </Card>
    );
  }
  if (!config) {
     return <Card title="Award Configuration"><Alert type="info" message="Loading configuration..." /></Card>;
  }


  const awardLevelOptions: AwardLevel[] = ['winner', 'runner_up', 'second_runner_up'];

  return (
    <Card title={`Award Configuration for "${currentHackathon.data.title}"`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Winner Scope</label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="winnerScope"
                value="overall"
                checked={config.scope === 'overall'}
                onChange={() => handleScopeChange('overall')}
                className="form-radio h-4 w-4 text-primary-600 dark:bg-neutral-600 border-neutral-300 dark:border-neutral-500"
              />
              <span className="ml-2 text-neutral-700 dark:text-neutral-200">Overall Event Winners</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="winnerScope"
                value="per_problem_statement"
                checked={config.scope === 'per_problem_statement'}
                onChange={() => handleScopeChange('per_problem_statement')}
                className="form-radio h-4 w-4 text-primary-600 dark:bg-neutral-600 border-neutral-300 dark:border-neutral-500"
              />
              <span className="ml-2 text-neutral-700 dark:text-neutral-200">Winners per Problem Statement</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Award Categories & Levels</h4>
          {config.awardCategories.length === 0 && config.scope === 'per_problem_statement' && (
            <Alert type="warning" message="No problem statements found for this hackathon. Please add problem statements first to configure awards per problem." />
          )}
          {config.awardCategories.map(category => (
            <div key={category.id} className="p-4 border dark:border-neutral-700 rounded-md mb-3 bg-neutral-50 dark:bg-neutral-750">
              <p className="font-medium text-neutral-700 dark:text-neutral-100">{category.name}</p>
              <div className="mt-2 space-y-1">
                {awardLevelOptions.map(level => (
                  <label key={level} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={category.allowedLevels.includes(level)}
                      onChange={(e) => handleLevelChange(category.id, level, e.target.checked)}
                      className="form-checkbox h-4 w-4 text-primary-600 dark:bg-neutral-600 border-neutral-300 dark:border-neutral-500 rounded"
                    />
                    <span className="ml-2 text-neutral-700 dark:text-neutral-200 capitalize">{level.replace('_', ' ')}</span>
                  </label>
                ))}
                {category.allowedLevels.length === 0 && <p className="text-xs text-red-500 dark:text-red-400">At least one level must be selected.</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" leftIcon={<Icons.Cog />}>Save Award Configuration</Button>
        </div>
      </form>
    </Card>
  );
};

export default WinnerConfigurationForm;
