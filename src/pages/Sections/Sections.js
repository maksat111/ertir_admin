import { React, useEffect, useState } from 'react';
import { DatePicker, Modal, message } from 'antd';
import dayjs from 'dayjs';
import date from 'date-and-time';
import { axiosInstance } from '../../config/axios';
import TableComponent from '../../components/TableComponent';
import Input from 'antd/es/input/Input';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

function Sections() {
    const dateFormat = 'YYYY-MM-DD';
    const [dataSource, setDataSource] = useState([]);
    const [open, setOpen] = useState(false);
    const today = date.format(new Date(), 'YYYY-MM-DD');
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [addOpen, setAddOpen] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [newItem, setNewItem] = useState(null);


    const showModal = (item) => {
        setOpen(true);
        setSelectedItem(item);
    };

    const handleOk = async () => {
        try {
            setConfirmLoading(true);
            await axiosInstance.delete(`section/delete/${selectedItem._id}/`);
            const newDataSource = dataSource.filter(element => element._id !== selectedItem._id);
            setDataSource(newDataSource);
            message.success('Успешно удалено!');
            setSelectedItem(null);
            setOpen(false);
            setConfirmLoading(false);
        } catch (err) {
            setConfirmLoading(false)
            message.error('Произошла ошибка. Пожалуйста, попробуйте еще раз!')
            console.log(err)
        }
    };

    const handleCancel = () => {
        setOpen(false);
        setSelectedItem(null);
    };

    useEffect(() => {
        axiosInstance.get('section/list').then(res => {
            console.log(res.data.data)
            res.data.data.forEach(element => {
                element.key = element._id
                // element.created_at = date.format(element.created_at, 'YYYY-MM-DD')
            });
            setDataSource(res.data.data);
        }).catch(err => console.log(err));
    }, []);

    const columns = [
        {
            title: 'Название (рус.)',
            dataIndex: 'name_ru',
            key: 'name_ru',
        },
        {
            title: 'Название (туркм.)',
            dataIndex: 'name_tm',
            key: 'name_tm',
        },
        {
            title: 'Дата создания',
            dataIndex: 'created_at',
            key: 'created_at',
        },
        {
            title: 'Удалить',
            dataIndex: 'active',
            key: 'active',
            width: '110px',
            render: (_, record) => (
                <div className='delete-icon' onClick={() => showModal(record)}>
                    Удалить
                </div>
            ),
        },
        {
            title: 'Изменить',
            dataIndex: 'active',
            key: 'active',
            width: '125px',
            render: (_, record) => (
                <div className='update-icon' onClick={() => showAddModal(record)}>
                    Изменить
                </div>
            ),
        },
    ];

    //---------------------------------------------------ADD MODAL-------------------------------------------//
    const showAddModal = (item) => {
        if (item._id) {
            setNewItem(item);
            setSelectedItem(item);
        };
        setAddOpen(true);
    };

    const handleAddOk = async () => {
        setConfirmLoading(true);
        const formData = new FormData();
        const keys = Object.keys(newItem);
        const values = Object.values(newItem);
        keys.forEach((key, index) => {
            formData.append(key, values[index]);
        })
        try {
            if (newItem._id) {
                const res = await axiosInstance.patch(`section/update/${newItem._id}`, formData);
                const index = dataSource.findIndex(item => item._id == newItem._id);
                setDataSource(previousState => {
                    const a = previousState;
                    a[index].name_ru = newItem.name_ru;
                    a[index].name_en = newItem.name_en;
                    return a;
                })
            } else {
                const res = await axiosInstance.post('section/create', formData);
                newItem._id = res.data.data?._id;
                newItem.key = res.data.data?._id;
                newItem.created_at = res.data.data?.created_at;
                setDataSource([...dataSource, newItem])
            }
            setConfirmLoading(false);
            setNewItem(null);
            message.success('Успешно!');
            setAddOpen(false);
        } catch (err) {
            setConfirmLoading(false)
            message.error('Произошла ошибка. Пожалуйста, попробуйте еще раз!')
            console.log(err)
        }
    };

    const handleAddCancel = () => {
        setAddOpen(false);
        setNewItem(null);
    };

    const handleAddChange = (e) => {
        setNewItem({ ...newItem, [e.target.name]: [e.target.value] });
    }

    return (
        <>
            <Modal
                title="Дополните детали"
                open={addOpen}
                onOk={handleAddOk}
                confirmLoading={confirmLoading}
                onCancel={handleAddCancel}
                cancelText={'Отмена'}
                okText={'Да'}
                width={'600px'}
                okType={'primary'}
                style={{ top: '150px' }}
            >
                <div className='banner-add-container'>
                    <div className='add-left'>
                        <div className='add-column'>
                            Название (рус.):
                        </div>
                        <div className='add-column'>
                            Название (туркм.):
                        </div>
                    </div>
                    <div className='add-right'>
                        <div className='add-column'>
                            <Input name='name_ru' placeholder='Название (рус.)' value={newItem?.name_ru} onChange={handleAddChange} />
                        </div>
                        <div className='add-column'>
                            <Input name='name_tm' placeholder='Название (туркм.)' value={newItem?.name_tm} onChange={handleAddChange} />
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal
                title="Вы уверены, что хотите удалить?"
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                cancelText={'Отмена'}
                okText={'Да'}
                okType={'primary'}
                okButtonProps={{ danger: true }}
                style={{
                    top: '200px'
                }}
            />
            <div className='page'>
                <div className='page-header-content'>
                    <h2>Разделы</h2>
                    <div className='add-button' onClick={showAddModal}>Добавить</div>
                </div>
                <TableComponent dataSource={dataSource} columns={columns} pagination={false} active={selectedItem?.id} />
            </div>
        </>
    );
}

export default Sections;