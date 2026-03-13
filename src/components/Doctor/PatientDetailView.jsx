import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Calendar, Activity, ClipboardList, Clock, Edit2, X, Save, RefreshCw } from 'lucide-react';
import { useTherapy } from '../../context/TherapyContext';

const PatientDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { patients, masterTemplates, updatePatientOverride, deletePatient } = useTherapy();
    const [isEditingOverride, setIsEditingOverride] = useState(false);
    const [draftOverride, setDraftOverride] = useState({ dos: '', donts: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const patientFromContext = patients.find(p => p.id === parseInt(id) || p.id === id);
    const [patient, setPatient] = useState(patientFromContext || null);
    const [loadingPatient, setLoadingPatient] = useState(!patientFromContext);

    // Fetch from backend if context is suddenly empty (e.g. hard refresh)
    useEffect(() => {
        if (!patientFromContext && id) {
            setLoadingPatient(true);
            import('../../api/axiosConfig').then(({ default: api }) => {
                api.get('/doctor/patients')
                    .then(res => {
                        const found = res.data.find(p => p.id === parseInt(id) || p.id === id);
                        if (found) setPatient(found);
                    })
                    .catch(err => console.error("Failed to fetch patient:", err))
                    .finally(() => setLoadingPatient(false));
            });
        } else if (patientFromContext) {
            setPatient(patientFromContext);
            setLoadingPatient(false);
        }
    }, [id, patientFromContext]);

    // Update draft overrides when patient or templates load
    useEffect(() => {
        if (patient && isEditingOverride) {
            const rules = patient.overrideRules || masterTemplates[patient.currentTherapy] || masterTemplates.Vamana || { dos: '', donts: '' };
            setDraftOverride({ dos: rules.dos || '', donts: rules.donts || '' });
        }
    }, [isEditingOverride, patient, masterTemplates]);

    if (loadingPatient) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ayur-green mb-4"></div>
                <h2 className="text-xl font-serif text-ayur-green">Loading Patient Details...</h2>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ayur-green mb-4"></div>
                <h2 className="text-xl font-serif text-ayur-green">Loading Patient Details...</h2>
                <p className="text-sm text-ayur-charcoal/60 mt-2">Or patient may not exist. If this takes too long,</p>
                <button
                    onClick={() => navigate('/doctor/patients')}
                    className="flex items-center gap-2 mt-6 px-6 py-2 bg-ayur-cream text-ayur-green rounded-full shadow-sm hover:bg-ayur-gold/20 transition-colors font-bold"
                >
                    <ArrowLeft size={16} /> Return to Dashboard
                </button>
            </div>
        );
    }

    const rules = patient.overrideRules || masterTemplates[patient.currentTherapy] || masterTemplates.Vamana || { dos: 'No standard protocol', donts: 'No standard protocol' };
    const isOverridden = !!patient.overrideRules;

    const handleSaveOverride = () => {
        updatePatientOverride(patient.id, draftOverride);
        setIsEditingOverride(false);
    };

    const handleClearOverride = () => {
        updatePatientOverride(patient.id, null);
        setIsEditingOverride(false);
    };

    const handleDelete = async () => {
        try {
            const { default: api } = await import('../../api/axiosConfig');
            await api.delete(`/doctor/patients/${patient.id}`);
            deletePatient(patient.id);
            navigate('/doctor/patients');
        } catch (error) {
            console.error("Failed to delete patient:", error);
            alert("Failed to delete patient. Check backend connection.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-ayur-gold/10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/doctor/patients')}
                        className="p-2 hover:bg-ayur-cream rounded-xl text-ayur-green transition-colors border border-transparent hover:border-ayur-gold/20"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-ayur-green">{patient.name || patient.user?.name || 'Unknown Patient'}</h1>
                        <p className="text-xs text-ayur-charcoal/60 font-sans uppercase tracking-widest mt-1">
                            PID: {patient.id} • {(patient.age || patient.user?.age) || 'N/A'}y • {(patient.gender || patient.user?.gender) || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <span className={`px-4 py-2 flex items-center rounded-xl text-xs font-bold uppercase tracking-wider border ${patient.status === 'Active'
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                        {patient.status}
                    </span>
                    <button
                        onClick={() => setIsDeleting(true)}
                        className="px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
                    >
                        Delete Patient
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleting && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleting(false)} className="absolute inset-0 bg-ayur-charcoal/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-8 rounded-[2rem] shadow-2xl z-10 w-full max-w-md border border-red-100 relative">
                            <h2 className="text-2xl font-serif font-bold text-ayur-charcoal mb-2">Delete {(patient.name || patient.user?.name || 'Patient')}?</h2>
                            <p className="text-ayur-charcoal/60 text-sm mb-8">This action cannot be undone and will remove all associated treatment records.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setIsDeleting(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm">Cancel</button>
                                <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/20">Confirm Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact and Basic Info */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-ayur-gold/10 space-y-6">
                    <div className="flex items-center gap-3 mb-4 text-ayur-green border-b border-ayur-gold/10 pb-4">
                        <User size={20} className="text-ayur-gold" />
                        <h2 className="font-serif font-bold text-lg">Patient Profile</h2>
                    </div>

                    <div className="space-y-4 font-sans text-sm">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-1">Email / Phone</p>
                            <p className="text-ayur-charcoal">{patient.email || patient.user?.email || 'N/A'}</p>
                            <p className="text-ayur-charcoal">{patient.phone || patient.user?.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-1">Prakriti (Constitution)</p>
                            <p className="text-ayur-green font-bold">{patient.prakriti || 'Not Assessed'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-1">Primary Diagnosis</p>
                            <p className="text-ayur-charcoal">{patient.diagnosis || 'Pending Diagnosis'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-1">Assigned Therapist</p>
                            <p className="text-ayur-charcoal">{patient.therapist || 'Unassigned'}</p>
                        </div>
                    </div>
                </div>

                {/* Treatment Status */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-ayur-gold/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3 text-ayur-green">
                                <Activity size={20} className="text-ayur-gold" />
                                <h2 className="font-serif font-bold text-lg">Clinical Status</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-ayur-cream p-5 rounded-2xl border border-ayur-gold/10">
                                <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-2">Current Therapy</p>
                                <p className="text-2xl font-serif font-bold text-ayur-green">{patient.currentTherapy || 'Consultation'}</p>
                            </div>
                            <div className="bg-ayur-cream p-5 rounded-2xl border border-ayur-gold/10">
                                <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-2">Recovery Progress</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-white h-2 rounded-full overflow-hidden border border-ayur-gold/10">
                                        <div
                                            className="bg-ayur-gold h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${patient.recovery || patient.recoveryProgress || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-lg font-bold text-ayur-green">{patient.recovery || patient.recoveryProgress || 0}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Protocol Instructions */}
                        <div className="border border-ayur-gold/20 rounded-2xl overflow-hidden">
                            <div className="bg-ayur-cream px-5 py-3 flex items-center justify-between border-b border-ayur-gold/20">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm text-ayur-green uppercase tracking-wider">
                                        Protocol Instructions
                                    </h3>
                                    {isOverridden && (
                                        <span className="bg-ayur-gold text-white text-[10px] px-2 py-0.5 rounded-full font-bold">OVERRIDDEN</span>
                                    )}
                                </div>
                                {!isEditingOverride && (
                                    <button
                                        onClick={() => setIsEditingOverride(true)}
                                        className="text-ayur-charcoal/40 hover:text-ayur-gold transition-colors flex items-center gap-1 text-xs font-bold uppercase"
                                    >
                                        <Edit2 size={14} /> Customize
                                    </button>
                                )}
                            </div>

                            <div className="p-5">
                                {isEditingOverride ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-ayur-charcoal/40 uppercase tracking-widest mb-1 block">Dos (Enna pannanum)</label>
                                            <textarea
                                                className="w-full text-sm font-sans p-3 bg-white border border-ayur-gold/20 rounded-xl resize-none focus:outline-none focus:border-ayur-gold"
                                                rows="2"
                                                value={draftOverride.dos}
                                                onChange={(e) => setDraftOverride({ ...draftOverride, dos: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-ayur-charcoal/40 uppercase tracking-widest mb-1 block">Don'ts (Enna panna kudadhu)</label>
                                            <textarea
                                                className="w-full text-sm font-sans p-3 bg-white border border-ayur-gold/20 rounded-xl resize-none focus:outline-none focus:border-ayur-gold"
                                                rows="2"
                                                value={draftOverride.donts}
                                                onChange={(e) => setDraftOverride({ ...draftOverride, donts: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-end gap-2 pt-2">
                                            {isOverridden && (
                                                <button
                                                    onClick={handleClearOverride}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <RefreshCw size={14} /> Reset to Master
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setIsEditingOverride(false)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-ayur-charcoal/60 hover:bg-ayur-charcoal/5 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveOverride}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-ayur-green text-white rounded-lg hover:bg-ayur-green/90 transition-colors shadow-sm"
                                            >
                                                <Save size={14} /> Save Override
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-ayur-cream border border-ayur-gold/10 rounded-xl h-fit">
                                                <Clock size={20} className="text-ayur-gold" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-ayur-charcoal mb-1">Dos (Enna pannanum)</h4>
                                                <p className="text-xs text-ayur-charcoal/60 leading-relaxed whitespace-pre-wrap">{rules.dos}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-ayur-cream border border-ayur-gold/10 rounded-xl h-fit">
                                                <ClipboardList size={20} className="text-ayur-gold" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-ayur-charcoal mb-1">Don'ts (Enna panna kudadhu)</h4>
                                                <p className="text-xs text-ayur-charcoal/60 leading-relaxed whitespace-pre-wrap">{rules.donts}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Treatment History Section */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-ayur-gold/10">
                        <div className="flex items-center gap-3 mb-6 text-ayur-green">
                            <ClipboardList size={20} className="text-ayur-gold" />
                            <h2 className="font-serif font-bold text-lg">Treatment History</h2>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((session, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-ayur-gold/20 transition-colors">
                                    <div className="flex-shrink-0 w-12 h-12 bg-ayur-cream rounded-xl flex items-center justify-center text-ayur-gold font-bold">
                                        S{3 - i}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm text-ayur-green">Session Completed</h4>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{10 - (i * 2)} days ago</span>
                                        </div>
                                        <p className="text-xs text-ayur-charcoal/60 leading-relaxed">
                                            {patient.currentTherapy || 'Consultation'} administered by {patient.therapist || 'Specialist'}. Patient showed stable vitals throughout the procedure. Mild fatigue post-session, advised standard rest protocol.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-ayur-green p-6 rounded-[2rem] shadow-sm text-white relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-10">
                            <Calendar size={150} />
                        </div>
                        <h2 className="font-serif font-bold text-lg mb-2 relative z-10">Next Scheduled Session</h2>
                        <p className="text-sm text-ayur-cream/80 mb-6 relative z-10">Review logs and prepare for the upcoming clinical appointment.</p>
                        <button className="bg-ayur-gold text-ayur-green font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-white transition-colors relative z-10 shadow-lg">
                            Schedule Appointment
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PatientDetailView;
