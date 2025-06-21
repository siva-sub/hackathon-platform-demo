
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { HackathonStage, MatrixCriterion, JudgeUser } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Icons } from '../../constants';
import Alert from '../ui/Alert';

const StageCriterionForm: React.FC<{
    stageId: string;
    criterion: MatrixCriterion | Omit<MatrixCriterion, 'id'>;
    onSave: (criterion: MatrixCriterion) => void;
    onCancel: () => void;
    isEditing: boolean;
}> = ({ stageId, criterion, onSave, onCancel, isEditing }) => {
    const [currentCriterion, setCurrentCriterion] = useState(criterion);

    const handleChange = (field: keyof MatrixCriterion, value: string | number) => {
        setCurrentCriterion(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!currentCriterion.name.trim() || (currentCriterion.maxScore !== undefined && currentCriterion.maxScore <= 0)) {
            alert("Criterion name and a positive max score are required.");
            return;
        }
        onSave(currentCriterion as MatrixCriterion);
    };
    
    return (
        <div className="p-3 my-2 border rounded-md dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-750 space-y-2">
            <Input label="Criterion Name" value={currentCriterion.name} onChange={e => handleChange('name', e.target.value)} containerClassName="mb-1"
                   placeholder="e.g., Innovation & Originality"/>
            <Textarea label="Description" value={currentCriterion.description} onChange={e => handleChange('description', e.target.value)} rows={2} containerClassName="mb-1"
                      placeholder="AI can help generate varied criteria descriptions."/>
            <Input label="Max Score" type="number" value={currentCriterion.maxScore} onChange={e => handleChange('maxScore', parseInt(e.target.value) || 0)} containerClassName="mb-1"/>
            <div className="flex space-x-2">
                <Button onClick={handleSave} size="sm" variant="primary">{isEditing ? "Save Criterion" : "Add Criterion"}</Button>
                <Button onClick={onCancel} size="sm" variant="ghost">Cancel</Button>
            </div>
        </div>
    );
};

const AssignJudgesToStage: React.FC<{
    stage: HackathonStage;
    allJudges: JudgeUser[];
    onAssignJudge: (stageId: string, judgeEmail: string) => void;
    onRemoveJudge: (stageId: string, judgeEmail: string) => void;
    isHackathonApproved: boolean;
}> = ({ stage, allJudges, onAssignJudge, onRemoveJudge, isHackathonApproved }) => {
    const [selectedJudgeToAssign, setSelectedJudgeToAssign] = useState('');

    const availableJudgesToAssign = allJudges.filter(
        judge => !stage.assignedJudgeEmails.map(je => je.toLowerCase()).includes(judge.email.toLowerCase())
    );
    
    const handleAssign = () => {
        if(selectedJudgeToAssign) {
            onAssignJudge(stage.id, selectedJudgeToAssign);
            setSelectedJudgeToAssign('');
        }
    };

    return (
        <div className="mt-3 pt-3 border-t dark:border-neutral-600">
            <h6 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100 mb-1">Assigned Judges:</h6>
            {!isHackathonApproved && (
                <Alert type="warning" message="Judge assignment is disabled. This hackathon requires Super Admin approval first." />
            )}
            {stage.assignedJudgeEmails.length === 0 && isHackathonApproved && (
                <p className="text-xs text-neutral-500 dark:text-neutral-300">No judges assigned to this stage yet.</p>
            )}
            {isHackathonApproved && stage.assignedJudgeEmails.length > 0 && (
                <ul className="list-disc pl-5 text-xs text-neutral-600 dark:text-neutral-200 space-y-1 mb-2">
                    {stage.assignedJudgeEmails.map(email => (
                        <li key={email} className="flex justify-between items-center">
                            {email}
                            <Button 
                                size="sm" 
                                variant="danger" 
                                onClick={() => onRemoveJudge(stage.id, email)} 
                                leftIcon={<Icons.MinusCircle />} 
                                className="ml-2 px-1 py-0.5 text-xs"
                                disabled={!isHackathonApproved}
                            >
                                Remove
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
             {isHackathonApproved && (
                <div className="flex items-center space-x-2 mt-2">
                    <select
                        value={selectedJudgeToAssign}
                        onChange={e => setSelectedJudgeToAssign(e.target.value)}
                        className="mt-1 block w-full pl-2 pr-8 py-1.5 text-xs border-neutral-300 dark:border-neutral-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 rounded-md bg-white dark:bg-neutral-600 dark:text-neutral-100 flex-grow"
                        disabled={!isHackathonApproved || availableJudgesToAssign.length === 0}
                    >
                        <option value="">-- Select Judge to Assign --</option>
                        {availableJudgesToAssign.map(judge => (
                            <option key={judge.id} value={judge.email}>{judge.email}</option>
                        ))}
                    </select>
                    <Button onClick={handleAssign} disabled={!isHackathonApproved || !selectedJudgeToAssign || availableJudgesToAssign.length === 0} variant="secondary" size="sm" className="text-xs px-2 py-1" leftIcon={<Icons.UserPlus />}>
                        Assign Judge
                    </Button>
                </div>
             )}
            {isHackathonApproved && allJudges.length === 0 && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">No platform judges available. A SuperAdmin needs to add them first.</p>}
        </div>
    );
};


const HackathonStagesForm: React.FC = () => {
  const { 
    getCurrentHackathon, 
    addStageToCurrentHackathon, 
    updateStageInCurrentHackathon, 
    deleteStageInCurrentHackathon, 
    addCriterionToStageInCurrentHackathon, 
    updateCriterionInStageInCurrentHackathon, 
    deleteCriterionInStageInCurrentHackathon,
    judges: platformJudges, 
    assignJudgeToStage,
    removeJudgeFromStage,
  } = useAppContext();
  
  const currentHackathon = getCurrentHackathon();
  const isCurrentHackathonApproved = currentHackathon?.data.status === 'approved';

  const [newStageName, setNewStageName] = useState('');
  const [newStageOrder, setNewStageOrder] = useState(currentHackathon?.data.stages.length ? currentHackathon.data.stages.length + 1 : 1);
  const [newStageDescription, setNewStageDescription] = useState('');
  
  const [editingStage, setEditingStage] = useState<HackathonStage | null>(null);
  const [editingCriterion, setEditingCriterion] = useState<{stageId: string, criterion: MatrixCriterion | null} | null>(null);
  const [addingCriterionToStage, setAddingCriterionToStage] = useState<string | null>(null);

  React.useEffect(() => { 
    if (currentHackathon) {
        setNewStageOrder(currentHackathon.data.stages.length + 1);
    }
  }, [currentHackathon?.data.stages.length, currentHackathon]);


  const handleAddStage = () => {
    if (!newStageName.trim() || newStageOrder <= 0) {
        alert("Stage name and a positive order number are required.");
        return;
    }
    addStageToCurrentHackathon({ name: newStageName, order: newStageOrder, description: newStageDescription, judgingCriteria: [] });
    setNewStageName('');
    setNewStageOrder(currentHackathon ? currentHackathon.data.stages.length + 2 : 1); 
    setNewStageDescription('');
  };

  const handleUpdateStage = () => {
    if (!editingStage || !editingStage.name.trim() || editingStage.order <= 0) {
        alert("Stage name and a positive order number are required for update.");
        return;
    }
    updateStageInCurrentHackathon(editingStage); 
    setEditingStage(null);
  };
  
  const handleSaveCriterion = (stageId: string) => (criterionToSave: MatrixCriterion) => {
    if (criterionToSave.id && criterionToSave.id !== 'temp') { 
        updateCriterionInStageInCurrentHackathon(stageId, criterionToSave);
    } else { 
        const { id, ...restOfCriterion } = criterionToSave; 
        addCriterionToStageInCurrentHackathon(stageId, restOfCriterion);
    }
    setEditingCriterion(null);
    setAddingCriterionToStage(null);
  };

  const handleAssignJudgeToStage = (stageId: string, judgeEmail: string) => {
    if (currentHackathon && isCurrentHackathonApproved) {
        assignJudgeToStage(currentHackathon.id, stageId, judgeEmail);
    } else if (currentHackathon) {
        alert(`Cannot assign judge. Hackathon "${currentHackathon.data.title}" is not approved.`);
    }
  };
  const handleRemoveJudgeFromStage = (stageId: string, judgeEmail: string) => {
     if (currentHackathon && isCurrentHackathonApproved) {
        removeJudgeFromStage(currentHackathon.id, stageId, judgeEmail);
    } else if (currentHackathon) {
         alert(`Cannot remove judge. Hackathon "${currentHackathon.data.title}" is not approved.`);
    }
  };


  if (!currentHackathon) {
     return (
      <Card title="Manage Hackathon Stages & Judging Criteria">
        <Alert type="info" message="No hackathon selected. Please choose a hackathon from the dropdown in the Admin dashboard to manage its stages."/>
      </Card>
    );
  }


  return (
    <Card title={`Manage Stages & Criteria for "${currentHackathon.data.title}"`}>
      {!isCurrentHackathonApproved && (
        <Alert type="warning" title="Hackathon Not Approved" message={`This hackathon ("${currentHackathon.data.title}") is currently ${currentHackathon.data.status}. Some functionalities like judge assignment are disabled until it's approved by a Super Admin.`} />
      )}
      <div className="space-y-6 mb-8">
        {currentHackathon.data.stages.sort((a,b)=> a.order - b.order).map((stage) => (
          <div key={stage.id} className="p-4 border dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-750 shadow-sm">
            {editingStage?.id === stage.id ? (
              <div className="space-y-3">
                <Input label="Stage Name" value={editingStage.name} onChange={(e) => setEditingStage({...editingStage, name: e.target.value})} />
                <Input label="Order" type="number" value={editingStage.order} onChange={(e) => setEditingStage({...editingStage, order: parseInt(e.target.value) || 1})} />
                <Textarea label="Description" value={editingStage.description} onChange={(e) => setEditingStage({...editingStage, description: e.target.value})} rows={2}
                          placeholder="AI can help define clear objectives for this stage."/>
                <div className="flex space-x-2">
                    <Button onClick={handleUpdateStage} variant="primary">Save Stage</Button>
                    <Button onClick={() => setEditingStage(null)} variant="ghost">Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">{stage.name} (Order: {stage.order})</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-200">{stage.description}</p>
                    </div>
                    <div className="space-x-2 flex-shrink-0">
                        <Button onClick={() => setEditingStage(stage)} size="sm" variant="ghost" leftIcon={<Icons.Pencil />} aria-label="Edit Stage" />
                        <Button onClick={() => {if(confirm('Are you sure you want to delete this stage and all its criteria?')) deleteStageInCurrentHackathon(stage.id)}} size="sm" variant="danger" leftIcon={<Icons.Trash />} aria-label="Delete Stage" />
                    </div>
                </div>
                
                <h5 className="text-md font-semibold mt-2 mb-1 text-neutral-700 dark:text-neutral-100">Judging Criteria for {stage.name}:</h5>
                {stage.judgingCriteria.length === 0 && <p className="text-xs text-neutral-500 dark:text-neutral-300">No criteria defined for this stage yet.</p>}
                <div className="space-y-2">
                {stage.judgingCriteria.map(crit => (
                    <div key={crit.id} className="p-2 border-l-4 border-primary-500 dark:border-primary-400 bg-neutral-100 dark:bg-neutral-750 rounded-r-md">
                        {editingCriterion?.stageId === stage.id && editingCriterion?.criterion?.id === crit.id ? (
                            <StageCriterionForm 
                                stageId={stage.id}
                                criterion={editingCriterion.criterion}
                                onSave={handleSaveCriterion(stage.id)}
                                onCancel={() => setEditingCriterion(null)}
                                isEditing={true}
                            />
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-neutral-800 dark:text-neutral-100">{crit.name} (Max: {crit.maxScore})</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-200">{crit.description}</p>
                                </div>
                                <div className="space-x-1">
                                    <Button onClick={() => setEditingCriterion({stageId: stage.id, criterion: crit})} size="sm" variant="ghost" leftIcon={<Icons.Pencil />} aria-label="Edit Criterion"/>
                                    <Button onClick={() => {if(confirm('Delete this criterion?')) deleteCriterionInStageInCurrentHackathon(stage.id, crit.id)}} size="sm" variant="danger" leftIcon={<Icons.Trash />} aria-label="Delete Criterion"/>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                </div>
                {addingCriterionToStage === stage.id ? (
                     <StageCriterionForm 
                        stageId={stage.id}
                        criterion={{ id: 'temp', name: '', description: '', maxScore: 10 }} 
                        onSave={handleSaveCriterion(stage.id)}
                        onCancel={() => setAddingCriterionToStage(null)}
                        isEditing={false}
                    />
                ) : (
                    <Button onClick={() => {setAddingCriterionToStage(stage.id); setEditingCriterion(null);}} size="sm" variant="secondary" leftIcon={<Icons.PlusCircle />} className="mt-3">Add Criterion to {stage.name}</Button>
                )}

                <AssignJudgesToStage 
                    stage={stage} 
                    allJudges={platformJudges} 
                    onAssignJudge={handleAssignJudgeToStage} 
                    onRemoveJudge={handleRemoveJudgeFromStage}
                    isHackathonApproved={isCurrentHackathonApproved}
                />

              </div>
            )}
          </div>
        ))}
        {currentHackathon.data.stages.length === 0 && <p className="text-neutral-500 dark:text-neutral-300">No stages defined yet for this hackathon.</p>}
      </div>

      {!editingStage && (
        <div className="mt-8 pt-6 border-t dark:border-neutral-700">
            <h3 className="text-xl font-semibold mb-3 text-neutral-800 dark:text-neutral-100">Add New Hackathon Stage</h3>
            <div className="space-y-4 p-4 bg-neutral-100 dark:bg-neutral-750 rounded-lg">
                <Input
                label="Stage Name"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="e.g., Final Prototype Submission"
                />
                <Input
                label="Order (numeric, defines sequence)"
                type="number"
                min="1"
                value={newStageOrder}
                onChange={(e) => setNewStageOrder(parseInt(e.target.value) || 0)}
                />
                <Textarea
                label="Stage Description"
                value={newStageDescription}
                onChange={(e) => setNewStageDescription(e.target.value)}
                placeholder="Briefly describe what this stage involves for participants and judges. AI can provide guidance on what constitutes a 'good' prototype for this stage."
                rows={3}
                />
                <Button onClick={handleAddStage} variant="primary" leftIcon={<Icons.PlusCircle />}>Add Stage</Button>
            </div>
        </div>
      )}
    </Card>
  );
};

export default HackathonStagesForm;