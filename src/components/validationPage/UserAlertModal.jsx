import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../Modal';
import Table from '../Table';
import { getFoundUsersColumns } from '../../utils/ValidationPage2Utils';

const UserAlertModal = ({ isOpen, onClose, users }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3 text-amber-600">
                    <AlertTriangle size={32} />
                    <span className="text-xl font-bold text-slate-800">Actualización de Usuarios Requerida</span>
                </div>
            }
        >
            <p className="text-slate-600 mb-4">
                La información de los siguientes usuarios registrados no coincide con SIAFP y debe ser actualizada.
            </p>
            <div className="bg-slate-50 rounded-lg border border-slate-200 h-[300px] mb-6 overflow-hidden flex flex-col">
                <Table
                    data={users}
                    itemsPerPage={50}
                    className="border-none shadow-none bg-transparent h-full"
                    columns={getFoundUsersColumns()}
                />
            </div>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                    Cerrar
                </button>
            </div>
        </Modal>
    );
};

export default UserAlertModal;
