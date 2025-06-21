
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { ProblemStatement } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Icons } from '../../constants';
import Alert from '../ui/Alert';

const ProblemStatementsForm: React.FC = () => {
  const { 
    getCurrentHackathon, 
    addProblemStatementToCurrentHackathon, 
    updateProblemStatementInCurrentHackathon, 
    deleteProblemStatementInCurrentHackathon 
  } = useAppContext();

  const currentHackathon = getCurrentHackathon();
  
  const [newPsTitle, setNewPsTitle] = useState('');
  const [newPsDescription, setNewPsDescription] = useState('');
  const [editingPs, setEditingPs] = useState<ProblemStatement | null>(null);

  const handleAddProblemStatement = () => {
    if (!newPsTitle.trim() || !newPsDescription.trim()) {
        alert("Title and description are required.");
        return;
    }
    addProblemStatementToCurrentHackathon({ title: newPsTitle, description: newPsDescription });
    setNewPsTitle('');
    setNewPsDescription('');
  };

  const handleUpdateProblemStatement = () => {
    if (!editingPs || !editingPs.title.trim() || !editingPs.description.trim()) {
        alert("Title and description are required for update.");
        return;
    }
    updateProblemStatementInCurrentHackathon(editingPs);
    setEditingPs(null);
  };

  if (!currentHackathon) {
    return (
      <Card title="Manage Problem Statements">
        <Alert type="info" message="No hackathon selected. Please choose a hackathon from the dropdown in the Admin dashboard to manage its problem statements."/>
      </Card>
    );
  }

  return (
    <Card title={`Manage Problem Statements for "${currentHackathon.data.title}"`}>
      <div className="space-y-4 mb-6">
        {currentHackathon.data.problemStatements.map((ps) => (
          <div key={ps.id} className="p-4 border dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-750">
            {editingPs?.id === ps.id ? (
              <div className="space-y-3">
                <Input 
                  label="Title"
                  value={editingPs.title} 
                  onChange={(e) => setEditingPs({...editingPs, title: e.target.value})}
                  containerClassName="mb-0"
                />
                <Textarea
                  label="Description"
                  value={editingPs.description} 
                  onChange={(e) => setEditingPs({...editingPs, description: e.target.value})}
                  containerClassName="mb-0"
                  rows={3}
                  placeholder="AI can help brainstorm diverse and impactful problem statements within a given theme."
                />
                <div className="flex space-x-2 mt-2">
                    <Button onClick={handleUpdateProblemStatement} size="sm" variant="primary">Save Changes</Button>
                    <Button onClick={() => setEditingPs(null)} size="sm" variant="ghost">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100">{ps.title}</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-200 whitespace-pre-wrap">{ps.description}</p>
                </div>
                <div className="space-x-2 flex-shrink-0 ml-4">
                  <Button onClick={() => setEditingPs(ps)} size="sm" variant="ghost" leftIcon={<Icons.Pencil />} aria-label="Edit" />
                  <Button onClick={() => {if(confirm('Are you sure?')) deleteProblemStatementInCurrentHackathon(ps.id)}} size="sm" variant="danger" leftIcon={<Icons.Trash />} aria-label="Delete" />
                </div>
              </div>
            )}
          </div>
        ))}
        {currentHackathon.data.problemStatements.length === 0 && <p className="text-neutral-500 dark:text-neutral-300">No problem statements defined yet for this hackathon.</p>}
      </div>

      <div className="mt-6 pt-6 border-t dark:border-neutral-700">
        <h3 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-neutral-100">{editingPs ? 'Edit Problem Statement' : 'Add New Problem Statement'}</h3>
        <div className="space-y-4">
            <Input
            label="Title"
            value={editingPs ? editingPs.title : newPsTitle}
            onChange={(e) => editingPs ? setEditingPs({...editingPs, title: e.target.value}) : setNewPsTitle(e.target.value)}
            placeholder="e.g., Sustainable Urban Living"
            />
            <Textarea
            label="Description"
            value={editingPs ? editingPs.description : newPsDescription}
            onChange={(e) => editingPs ? setEditingPs({...editingPs, description: e.target.value}) : setNewPsDescription(e.target.value)}
            placeholder="Detailed description of the problem statement. AI can assist in refining the scope and impact."
            rows={4}
            />
            {editingPs ? (
                 <div className="flex space-x-2 mt-2">
                    <Button onClick={handleUpdateProblemStatement} variant="primary" leftIcon={<Icons.Pencil/>}>Save Changes</Button>
                    <Button onClick={() => setEditingPs(null)} variant="ghost">Cancel Edit</Button>
                </div>
            ) : (
                 <Button onClick={handleAddProblemStatement} variant="secondary" leftIcon={<Icons.PlusCircle />}>Add Problem Statement</Button>
            )}
        </div>
      </div>
    </Card>
  );
};

export default ProblemStatementsForm;
