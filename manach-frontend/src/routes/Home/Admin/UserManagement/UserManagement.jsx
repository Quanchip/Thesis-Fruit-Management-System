import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Modal, Tag, Space, message, Switch, Form } from 'antd';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ 
    user_name: '', name: '', phone: '', email: '', bank_account: '', 
    role_id: 2, is_active: true, is_email_verified: false 
  });

  const { token } = useSelector((state) => state.userReducer);

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/user', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchText, role: roleFilter }
      });
      setUsers(res.data.content);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchText, roleFilter]);

  // Actions
  const handleToggleStatus = async (record) => {
    if (record.role_id === 1 && record.is_active) {
      return message.error("Cannot disable an admin user.");
    }
    
    const action = record.is_active ? 'disable' : 'enable';
    try {
      await axios.put(`http://localhost:8080/user/${record.user_id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success(`User successfully ${action}d.`);
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleDelete = (record) => {
    if (record.role_id === 1) {
      return message.error("Cannot delete an admin user.");
    }

    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: `This action cannot be undone. User: ${record.full_name}`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      okButtonProps: { style: { backgroundColor: '#EF4444', borderColor: '#EF4444' } },
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:8080/user/${record.user_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success("User deleted successfully.");
          fetchUsers();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete user');
        }
      }
    });
  };

  const handleView = (record) => {
    setSelectedUser(record);
    setViewVisible(true);
  };

  const handleEditClick = (record) => {
    setSelectedUser(record);
    setEditForm({
      user_name: record.user_name || '',
      name: record.full_name || '',
      phone: record.phone || '',
      email: record.email || '',
      bank_account: record.bank_account || '',
      role_id: record.role_id,
      is_active: record.is_active,
      is_email_verified: record.is_email_verified
    });
    setEditVisible(true);
  };

  const submitEdit = async () => {
    try {
      await axios.put(`http://localhost:8080/user/${selectedUser.user_id}/admin-edit`, {
        user_name: editForm.user_name,
        full_name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        bank_account: editForm.bank_account,
        role_id: editForm.role_id,
        is_active: editForm.is_active,
        is_email_verified: editForm.is_email_verified
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success("User updated successfully");
      setEditVisible(false);
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 400) {
         message.error(error.response.data.message);
      } else {
         message.error("Failed to update user");
      }
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 70,
    },
    {
      title: 'Username / Name',
      key: 'name_info',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold">{record.user_name || 'No Username'}</span>
          <span className="text-sm text-gray-500">{record.full_name || 'No Name'}</span>
        </div>
      )
    },
    {
      title: 'Email / Phone',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col text-sm text-gray-500">
          <span>{record.email || 'No email'}</span>
          <span>{record.phone || 'No phone'}</span>
        </div>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, record) => (
        <Tag color={record.role_id === 1 ? 'gold' : 'blue'}>
          {record.role_id === 1 ? 'ADMIN' : 'USER'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.is_active ? 'green' : 'red'}>
          {record.is_active ? 'ACTIVE' : 'DISABLED'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => text ? format(new Date(text), 'MMM dd, yyyy') : 'N/A',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            size="small" 
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button 
            size="small" 
            onClick={() => handleEditClick(record)}
          >
            Edit
          </Button>
          <Button 
            type="primary" 
            ghost 
            size="small"
            style={{ color: '#485935', borderColor: '#485935' }}
            onClick={() => handleToggleStatus(record)}
            disabled={record.role_id === 1}
          >
            {record.is_active ? 'Disable' : 'Enable'}
          </Button>
          <Button 
            danger 
            size="small" 
            onClick={() => handleDelete(record)}
            disabled={record.role_id === 1}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 w-full min-h-screen" style={{ backgroundColor: '#F5F7F0' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#485935' }}>User Management</h1>
          <p className="text-gray-500 mt-1">Manage system accounts, access, and permissions.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex gap-4 mb-6">
          <Search
            placeholder="Search by name or email"
            allowClear
            onSearch={(val) => setSearchText(val)}
            style={{ width: 300 }}
          />
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={(val) => setRoleFilter(val)}
          >
            <Option value="all">All Roles</Option>
            <Option value="admin">Admins</Option>
            <Option value="customer">Customers</Option>
          </Select>
        </div>

        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="user_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      {/* View Modal */}
      <Modal
        title="User Details"
        open={viewVisible}
        onCancel={() => setViewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewVisible(false)}>Close</Button>
        ]}
      >
        {selectedUser && (
          <div className="flex flex-col gap-3 mt-4">
            <div><span className="font-semibold w-24 inline-block">ID:</span> {selectedUser.user_id}</div>
            <div><span className="font-semibold w-24 inline-block">Username:</span> {selectedUser.user_name}</div>
            <div><span className="font-semibold w-24 inline-block">Name:</span> {selectedUser.full_name}</div>
            <div><span className="font-semibold w-24 inline-block">Email:</span> {selectedUser.email}</div>
            <div><span className="font-semibold w-24 inline-block">Phone:</span> {selectedUser.phone}</div>
            <div><span className="font-semibold w-24 inline-block">Bank Account:</span> {selectedUser.bank_account || 'N/A'}</div>
            <div><span className="font-semibold w-24 inline-block">Role:</span> {selectedUser.role_id === 1 ? 'Admin' : 'Customer'}</div>
            <div><span className="font-semibold w-24 inline-block">Status:</span> {selectedUser.is_active ? 'Active' : 'Disabled'}</div>
            <div><span className="font-semibold w-24 inline-block">Joined:</span> {selectedUser.created_at ? format(new Date(selectedUser.created_at), 'MMM dd, yyyy') : 'N/A'}</div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit User Profile"
        open={editVisible}
        onOk={submitEdit}
        onCancel={() => setEditVisible(false)}
        okText="Save Changes"
        okButtonProps={{ style: { backgroundColor: '#485935', borderColor: '#485935' } }}
      >
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Username</label>
            <Input 
              value={editForm.user_name} 
              onChange={(e) => setEditForm({...editForm, user_name: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
            <Input 
              value={editForm.name} 
              onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
            <Input 
              value={editForm.email} 
              onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Phone (10 digits)</label>
            <Input 
              value={editForm.phone} 
              onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Bank Account</label>
            <Input 
              value={editForm.bank_account} 
              onChange={(e) => setEditForm({...editForm, bank_account: e.target.value})} 
            />
          </div>
          
          <div className="flex gap-8 mt-2">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Role</label>
              <Select 
                value={editForm.role_id} 
                onChange={(val) => setEditForm({...editForm, role_id: val})}
                style={{ width: 120 }}
                disabled={selectedUser?.role_id === 1}
              >
                <Option value={1}>Admin</Option>
                <Option value={2}>Customer</Option>
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Account Active</label>
              <Switch 
                checked={editForm.is_active} 
                onChange={(checked) => setEditForm({...editForm, is_active: checked})}
                disabled={selectedUser?.role_id === 1}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Email Verified</label>
              <Switch 
                checked={editForm.is_email_verified} 
                onChange={(checked) => setEditForm({...editForm, is_email_verified: checked})}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
