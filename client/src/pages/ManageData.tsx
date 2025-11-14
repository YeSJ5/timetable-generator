import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  teachersApi,
  subjectsApi,
  sectionsApi,
  roomsApi,
  labsApi,
  mappingsApi,
} from '../api/http';

type Tab = 'teachers' | 'subjects' | 'sections' | 'rooms' | 'labs' | 'mappings';

export default function ManageData() {
  const [activeTab, setActiveTab] = useState<Tab>('teachers');
  const queryClient = useQueryClient();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Data</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {(['teachers', 'subjects', 'sections', 'rooms', 'labs', 'mappings'] as Tab[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'teachers' && <TeachersTab />}
          {activeTab === 'subjects' && <SubjectsTab />}
          {activeTab === 'sections' && <SectionsTab />}
          {activeTab === 'rooms' && <RoomsTab />}
          {activeTab === 'labs' && <LabsTab />}
          {activeTab === 'mappings' && <MappingsTab />}
        </div>
      </div>
    </div>
  );
}

function TeachersTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', initials: '', preferredTime: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => (await teachersApi.getAll()).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => teachersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setFormData({ name: '', initials: '', preferredTime: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => teachersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setEditingId(null);
      setFormData({ name: '', initials: '', preferredTime: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teachersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (teacher: any) => {
    setEditingId(teacher.id);
    setFormData({
      name: teacher.name,
      initials: teacher.initials || '',
      preferredTime: teacher.preferredTime || '',
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Initials"
            value={formData.initials}
            onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
            className="px-4 py-2 border rounded"
          />
          <select
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            className="px-4 py-2 border rounded"
          >
            <option value="">No Preference</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingId ? 'Update' : 'Create'} Teacher
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', initials: '', preferredTime: '' });
            }}
            className="ml-2 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Initials</th>
              <th className="px-4 py-2 text-left">Preferred Time</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers?.map((teacher: any) => (
              <tr key={teacher.id} className="border-t">
                <td className="px-4 py-2">{teacher.name}</td>
                <td className="px-4 py-2">{teacher.initials || '-'}</td>
                <td className="px-4 py-2">{teacher.preferredTime || '-'}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(teacher)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(teacher.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubjectsTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ code: '', name: '', hoursPerWeek: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => (await subjectsApi.getAll()).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => subjectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setFormData({ code: '', name: '', hoursPerWeek: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subjectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setEditingId(null);
      setFormData({ code: '', name: '', hoursPerWeek: 0 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (subject: any) => {
    setEditingId(subject.id);
    setFormData({
      code: subject.code,
      name: subject.name,
      hoursPerWeek: subject.hoursPerWeek,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Hours/Week"
            value={formData.hoursPerWeek}
            onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })}
            className="px-4 py-2 border rounded"
            required
            min="1"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingId ? 'Update' : 'Create'} Subject
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ code: '', name: '', hoursPerWeek: 0 });
            }}
            className="ml-2 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Hours/Week</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects?.map((subject: any) => (
              <tr key={subject.id} className="border-t">
                <td className="px-4 py-2">{subject.code}</td>
                <td className="px-4 py-2">{subject.name}</td>
                <td className="px-4 py-2">{subject.hoursPerWeek}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(subject.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionsTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await sectionsApi.getAll()).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => sectionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      setFormData({ name: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => sectionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      setEditingId(null);
      setFormData({ name: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sectionsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (section: any) => {
    setEditingId(section.id);
    setFormData({ name: section.name });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Section Name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            className="px-4 py-2 border rounded flex-1"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editingId ? 'Update' : 'Create'} Section
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({ name: '' });
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections?.map((section: any) => (
              <tr key={section.id} className="border-t">
                <td className="px-4 py-2">{section.name}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(section)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(section.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoomsTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', type: 'lecture' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await roomsApi.getAll()).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => roomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setFormData({ name: '', type: 'lecture' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => roomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setEditingId(null);
      setFormData({ name: '', type: 'lecture' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (room: any) => {
    setEditingId(room.id);
    setFormData({ name: room.name, type: room.type });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Room Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="px-4 py-2 border rounded"
          >
            <option value="lecture">Lecture</option>
            <option value="lab">Lab</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingId ? 'Update' : 'Create'} Room
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', type: 'lecture' });
            }}
            className="ml-2 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms?.map((room: any) => (
              <tr key={room.id} className="border-t">
                <td className="px-4 py-2">{room.name}</td>
                <td className="px-4 py-2 capitalize">{room.type}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(room.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LabsTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    durationSlots: 2,
    teacherId: '',
    sectionId: '',
    roomId: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: labs } = useQuery({
    queryKey: ['labs'],
    queryFn: async () => (await labsApi.getAll()).data,
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => (await teachersApi.getAll()).data,
  });

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await sectionsApi.getAll()).data,
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await roomsApi.getAll()).data,
  });

  const labRooms = rooms?.filter((r: any) => r.type === 'lab') || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => labsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      setFormData({
        name: '',
        durationSlots: 2,
        teacherId: '',
        sectionId: '',
        roomId: '',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => labsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      setEditingId(null);
      setFormData({
        name: '',
        durationSlots: 2,
        teacherId: '',
        sectionId: '',
        roomId: '',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => labsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['labs'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (lab: any) => {
    setEditingId(lab.id);
    setFormData({
      name: lab.name,
      durationSlots: lab.durationSlots,
      teacherId: lab.teacherId,
      sectionId: lab.sectionId,
      roomId: lab.roomId,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Lab Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Duration (slots)"
            value={formData.durationSlots}
            onChange={(e) => setFormData({ ...formData, durationSlots: parseInt(e.target.value) })}
            className="px-4 py-2 border rounded"
            required
            min="2"
            max="3"
          />
          <select
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          >
            <option value="">Select Teacher</option>
            {teachers?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={formData.sectionId}
            onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          >
            <option value="">Select Section</option>
            {sections?.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={formData.roomId}
            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          >
            <option value="">Select Lab Room</option>
            {labRooms.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingId ? 'Update' : 'Create'} Lab
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                durationSlots: 2,
                teacherId: '',
                sectionId: '',
                roomId: '',
              });
            }}
            className="ml-2 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Duration</th>
              <th className="px-4 py-2 text-left">Teacher</th>
              <th className="px-4 py-2 text-left">Section</th>
              <th className="px-4 py-2 text-left">Room</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {labs?.map((lab: any) => (
              <tr key={lab.id} className="border-t">
                <td className="px-4 py-2">{lab.name}</td>
                <td className="px-4 py-2">{lab.durationSlots} slots</td>
                <td className="px-4 py-2">{lab.teacher?.name}</td>
                <td className="px-4 py-2">{lab.section?.name}</td>
                <td className="px-4 py-2">{lab.room?.name}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(lab)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(lab.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MappingsTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: '',
    sectionId: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: mappings } = useQuery({
    queryKey: ['mappings'],
    queryFn: async () => (await mappingsApi.getAll()).data,
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => (await teachersApi.getAll()).data,
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => (await subjectsApi.getAll()).data,
  });

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => (await sectionsApi.getAll()).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => mappingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      setFormData({ teacherId: '', subjectId: '', sectionId: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => mappingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      setEditingId(null);
      setFormData({ teacherId: '', subjectId: '', sectionId: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mappingsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mappings'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (mapping: any) => {
    setEditingId(mapping.id);
    setFormData({
      teacherId: mapping.teacherId,
      subjectId: mapping.subjectId,
      sectionId: mapping.sectionId,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <select
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          >
            <option value="">Select Teacher</option>
            {teachers?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          >
            <option value="">Select Subject</option>
            {subjects?.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
          <select
            value={formData.sectionId}
            onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
            className="px-4 py-2 border rounded"
            required
          >
            <option value="">Select Section</option>
            {sections?.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingId ? 'Update' : 'Create'} Mapping
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ teacherId: '', subjectId: '', sectionId: '' });
            }}
            className="ml-2 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Teacher</th>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Section</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings?.map((mapping: any) => (
              <tr key={mapping.id} className="border-t">
                <td className="px-4 py-2">{mapping.teacher?.name}</td>
                <td className="px-4 py-2">
                  {mapping.subject?.code} - {mapping.subject?.name}
                </td>
                <td className="px-4 py-2">{mapping.section?.name}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(mapping)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(mapping.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

