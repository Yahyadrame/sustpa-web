import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GeneratePvDtoSchema, GeneratePvDto } from '@/types/pv'; // À créer
import api from '@/lib/api';

interface PvGeneratorModalProps {
  defenseId: string;
  onClose: () => void;
}

export const PvGeneratorModal: React.FC<PvGeneratorModalProps> = ({ defenseId, onClose }) => {
  const { register, handleSubmit, watch, control } = useForm<GeneratePvDto>({
    resolver: zodResolver(GeneratePvDtoSchema),
    defaultValues: { 
      projectType: 'PFE',
      manualFields: { appreciations: [{ label: '', value: '' }] }
    }
  });

  const projectType = watch('projectType');
  const { fields, append, remove } = useFieldArray({ control, name: 'manualFields.appreciations' });

  const onSubmit = async (data: GeneratePvDto) => {
    try {
      const response = await api.post(`/reporting/pv/${defenseId}/generate`, data, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PV_${data.projectType}_${defenseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      onClose();
    } catch (error) {
      console.error('Erreur génération PV', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold">Générer le Procès-Verbal</h2>

      <select {...register('projectType')} className="border p-2 w-full">
        <option value="PFE">PFE</option>
        <option value="MEMOIRE">Mémoire</option>
        <option value="THESE">Thèse</option>
      </select>

      <div className="space-y-2">
        <label>Résumé / Déroulement</label>
        <textarea {...register('manualFields.deroulement')} className="border p-2 w-full" rows={3} />

        <label>Observations</label>
        <textarea {...register('manualFields.observations')} className="border p-2 w-full" rows={2} />

        <label>Recommandations</label>
        <textarea {...register('manualFields.recommandations')} className="border p-2 w-full" rows={2} />

        <label>Commentaire Décision (ex: Admis au grade de...)</label>
        <input {...register('manualFields.commentairesDecision')} className="border p-2 w-full" />
      </div>

      {projectType === 'THESE' && (
        <div className="bg-gray-100 p-2">
          <label>Mention Spécifique Thèse</label>
          <select {...register('theseSpecific.mentionThese')} className="border p-2 w-full">
            <option value="HONORABLE">Honorable</option>
            <option value="TRES_HONORABLE">Très Honorable</option>
            <option value="TRES_HONORABLE_FELICITATIONS">Très Honorable avec félicitations</option>
          </select>
        </div>
      )}

      {projectType !== 'THESE' && (
        <div>
          <label>Appréciations</label>
          {fields.map((item, index) => (
            <div key={item.id} className="flex gap-2 mb-2">
              <input {...register(`manualFields.appreciations.${index}.label`)} placeholder="Critère" className="border p-1" />
              <input {...register(`manualFields.appreciations.${index}.value`)} placeholder="Appréciation" className="border p-1" />
              <button type="button" onClick={() => remove(index)} className="text-red-500">X</button>
            </div>
          ))}
          <button type="button" onClick={() => append({ label: '', value: '' })} className="bg-blue-500 text-white p-1 text-sm">+ Ajouter</button>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button type="button" onClick={onClose} className="border p-2">Annuler</button>
        <button type="submit" className="bg-green-600 text-white p-2">Générer le PV</button>
      </div>
    </form>
  );
};
