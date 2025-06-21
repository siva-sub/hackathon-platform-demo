
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { EventSchema, EventSchemaLocation, EventSchemaOrganizer } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Alert from '../ui/Alert';
import { defaultEventSchemaConfig, Icons } from '../../constants'; 

const SchemaSettingsForm: React.FC = () => {
  const { getCurrentHackathon, updateCurrentSchemaConfig } = useAppContext();
  const currentHackathon = getCurrentHackathon();

  const [schemaData, setSchemaData] = useState<EventSchema>(defaultEventSchemaConfig);

  useEffect(() => {
    if (currentHackathon?.data) {
      const existingSchema = currentHackathon.data.schemaConfig;
      const hackathonData = currentHackathon.data;
      
      let baseAppUrl = window.location.href.split('#')[0];
      if (baseAppUrl.endsWith('index.html')) {
          baseAppUrl = baseAppUrl.substring(0, baseAppUrl.length - 'index.html'.length);
      }
      if (baseAppUrl.endsWith('/') && baseAppUrl !== `${window.location.protocol}//${window.location.host}/`) {
        baseAppUrl = baseAppUrl.slice(0, -1);
      }
      const derivedSchemaUrl = currentHackathon.id ? `${baseAppUrl}#/public-events/${currentHackathon.id}` : '';

      setSchemaData({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: existingSchema?.name || hackathonData.title || '',
        description: existingSchema?.description || (hackathonData.description ? hackathonData.description.substring(0, 250) + "..." : ''),
        startDate: existingSchema?.startDate || '',
        endDate: existingSchema?.endDate || '',
        eventStatus: existingSchema?.eventStatus || 'EventScheduled',
        eventAttendanceMode: existingSchema?.eventAttendanceMode || 'OnlineEventAttendanceMode',
        location: existingSchema?.location || { '@type': 'VirtualLocation', name: 'Online' },
        image: existingSchema?.image || hackathonData.ogConfig?.ogImage || hackathonData.publicPageContent?.imageUrl || '',
        organizer: existingSchema?.organizer || { '@type': 'Organization', name: 'Hackathon Platform Organizer' },
        url: derivedSchemaUrl, // Always use the derived URL
      });
    } else {
      setSchemaData(defaultEventSchemaConfig);
    }
  }, [currentHackathon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSchemaData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parentKey: 'location' | 'organizer', field: keyof EventSchemaLocation | keyof EventSchemaOrganizer, value: string) => {
    setSchemaData(prev => {
        const parentObject = prev[parentKey] || (parentKey === 'location' ? { '@type': 'VirtualLocation', name: '' } : { '@type': 'Organization', name: '' });
        return {
            ...prev,
            [parentKey]: {
                ...parentObject,
                [field]: value,
            },
        };
    });
  };
  
  const handleLocationTypeChange = (type: 'VirtualLocation' | 'Place') => {
    setSchemaData(prev => ({
        ...prev,
        location: {
            ...prev.location,
            '@type': type,
            address: type === 'VirtualLocation' ? undefined : (prev.location?.address || ''), 
            name: type === 'VirtualLocation' && prev.location?.name === '' ? 'Online' : prev.location?.name, // Default virtual location name if empty
        } as EventSchemaLocation
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHackathon) {
      alert("No hackathon selected to update.");
      return;
    }
    // The schemaData state already contains the derived URL
    const dataToSave: EventSchema = {
        ...schemaData,
        '@context': 'https://schema.org', // Ensure these are always set
        '@type': 'Event',
    };
    updateCurrentSchemaConfig(dataToSave);
    alert(`Schema markup settings for "${currentHackathon.data.title}" updated!`);
  };

  if (!currentHackathon) {
    return (
      <Card title="Schema Markup Settings (Event)">
        <Alert type="info" message="No hackathon selected. Please choose a hackathon from the dropdown in the Admin dashboard." />
      </Card>
    );
  }

  return (
    <Card title={`Schema Markup (Event) for "${currentHackathon.data.title}"`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-neutral-600 dark:text-neutral-200">
          Configure structured data for this event page. This helps search engines understand your event and can improve its visibility (e.g., rich snippets).
          Refer to <a href="https://schema.org/Event" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Schema.org/Event documentation</a> for details.
        </p>

        <Input
          label="Event Name (schema: name)"
          name="name"
          value={schemaData.name}
          onChange={handleChange}
          placeholder="Defaults to hackathon title"
          helperText="The official name of the event."
        />
        <Textarea
          label="Event Description (schema: description)"
          name="description"
          value={schemaData.description}
          onChange={handleChange}
          placeholder="Defaults to hackathon description"
          rows={3}
          helperText="A short description of the event (max 250-300 chars recommended)."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                label="Start Date & Time (schema: startDate)"
                name="startDate"
                type="datetime-local"
                value={schemaData.startDate}
                onChange={handleChange}
                helperText="ISO 8601 format (e.g., YYYY-MM-DDTHH:mm)."
            />
            <Input
                label="End Date & Time (schema: endDate)"
                name="endDate"
                type="datetime-local"
                value={schemaData.endDate}
                onChange={handleChange}
                helperText="ISO 8601 format."
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="eventStatus" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Event Status (schema: eventStatus)</label>
                <select id="eventStatus" name="eventStatus" value={schemaData.eventStatus} onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100">
                    <option value="EventScheduled">Scheduled</option>
                    <option value="EventRescheduled">Rescheduled</option>
                    <option value="EventPostponed">Postponed</option>
                    <option value="EventCancelled">Cancelled</option>
                    <option value="EventCompleted">Completed</option>
                </select>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Select the current status of the event.</p>
            </div>
            <div>
                <label htmlFor="eventAttendanceMode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Attendance Mode (schema: eventAttendanceMode)</label>
                 <select id="eventAttendanceMode" name="eventAttendanceMode" value={schemaData.eventAttendanceMode} onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100">
                    <option value="OnlineEventAttendanceMode">Online</option>
                    <option value="OfflineEventAttendanceMode">Offline (Physical)</option>
                    <option value="MixedEventAttendanceMode">Mixed (Hybrid)</option>
                </select>
                 <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">How participants will attend.</p>
            </div>
        </div>

        <fieldset className="border p-4 rounded-md dark:border-neutral-600">
            <legend className="text-sm font-medium text-neutral-700 dark:text-neutral-200 px-1">Location (schema: location)</legend>
            <div className="flex items-center space-x-4 mb-2">
                <label className="flex items-center">
                    <input type="radio" name="locationType" value="VirtualLocation" 
                           checked={schemaData.location?.['@type'] === 'VirtualLocation'} 
                           onChange={() => handleLocationTypeChange('VirtualLocation')} 
                           className="form-radio h-4 w-4 text-primary-600 dark:bg-neutral-600" />
                    <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-200">Virtual</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" name="locationType" value="Place"
                           checked={schemaData.location?.['@type'] === 'Place'}
                           onChange={() => handleLocationTypeChange('Place')}
                           className="form-radio h-4 w-4 text-primary-600 dark:bg-neutral-600" />
                    <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-200">Physical</span>
                </label>
            </div>
            <Input
                label="Location Name (schema: location.name)"
                name="locationName" 
                value={schemaData.location?.name || ''}
                onChange={(e) => handleNestedChange('location', 'name', e.target.value)}
                placeholder={schemaData.location?.['@type'] === 'VirtualLocation' ? "e.g., Online via Platform X, Zoom Meeting" : "e.g., Main Conference Hall, Tech Hub Venue"}
                helperText={schemaData.location?.['@type'] === 'VirtualLocation' ? "Name of the virtual venue or platform." : "Name of the physical venue."}
            />
            {schemaData.location?.['@type'] === 'Place' && (
                <Input
                    label="Location Address (schema: location.address)"
                    name="locationAddress" 
                    value={schemaData.location?.address || ''}
                    onChange={(e) => handleNestedChange('location', 'address', e.target.value)}
                    placeholder="e.g., 123 Innovation Drive, Tech City, CA 94000"
                    helperText="Full street address for physical locations."
                />
            )}
        </fieldset>
        
        <fieldset className="border p-4 rounded-md dark:border-neutral-600">
            <legend className="text-sm font-medium text-neutral-700 dark:text-neutral-200 px-1">Organizer (schema: organizer)</legend>
             <Input
                label="Organizer Name (schema: organizer.name)"
                name="organizerName" 
                value={schemaData.organizer?.name || ''}
                onChange={(e) => handleNestedChange('organizer', 'name', e.target.value)}
                placeholder="e.g., Your Organization Name"
            />
            <Input
                label="Organizer URL (schema: organizer.url) (Optional)"
                name="organizerUrl" 
                type="url"
                value={schemaData.organizer?.url || ''}
                onChange={(e) => handleNestedChange('organizer', 'url', e.target.value)}
                placeholder="https://yourorganization.com"
            />
        </fieldset>


        <Input
          label="Primary Image URL (schema: image)"
          name="image"
          type="url"
          value={schemaData.image}
          onChange={handleChange}
          placeholder="Defaults to OG image or public page image"
          helperText="A URL for an image representing the event. Can be the same as OG image."
        />
        <div>
            <label htmlFor="schemaUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Event Page URL (schema: url)</label>
            <div className="mt-1">
                <Input
                    id="schemaUrl"
                    name="url" 
                    type="url"
                    value={schemaData.url} // Displays the derived URL from state
                    readOnly 
                    className="flex-grow"
                    containerClassName="mb-0 flex-grow"
                    helperText="The canonical URL for this event page. This is auto-populated and uses hash-based routing."
                />
            </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary">Save Schema Settings</Button>
        </div>
      </form>
    </Card>
  );
};

export default SchemaSettingsForm;