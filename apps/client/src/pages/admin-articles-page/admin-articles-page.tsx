import type { CreateArticleRequest } from '@narcissus/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Select, Space, Table, message } from 'antd';
import { useState } from 'react';

import styles from './admin-articles-page.module.css';

import { articlesService } from '@/features/articles/services/articles-service';
import { taxonomyService } from '@/features/taxonomy/services/taxonomy-service';

interface FormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  categoryId?: string;
}

export function AdminArticlesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => articlesService.getAdminList({ page: 1, pageSize: 50 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: taxonomyService.getAdminCategories,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateArticleRequest) => articlesService.create(payload),
    onSuccess: async () => {
      message.success('文章创建成功');
      setOpen(false);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: () => {
      message.error('创建失败，请检查字段是否重复');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articlesService.remove(id),
    onSuccess: async () => {
      message.success('文章删除成功');
      await queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>文章管理</h1>
        <Button type="primary" onClick={() => setOpen(true)}>
          新建文章
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list ?? []}
        pagination={false}
        columns={[
          { title: '标题', dataIndex: 'title', width: 280 },
          { title: '分类', dataIndex: 'categoryName', width: 120 },
          { title: '状态', dataIndex: 'status', width: 100 },
          {
            title: '操作',
            width: 120,
            render: (_value, record: { id: string }) => (
              <Space>
                <Button danger size="small" onClick={() => deleteMutation.mutate(record.id)}>
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="新建文章"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            createMutation.mutate({
              title: values.title,
              slug: values.slug,
              excerpt: values.excerpt,
              content: values.content,
              status: values.status,
              categoryId: values.categoryId,
            });
          }}
          initialValues={{
            status: 'draft',
          }}
        >
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item label="Slug" name="slug" rules={[{ required: true, message: '请输入 slug' }]}>
            <Input placeholder="请输入文章 slug，例如 react-hooks-guide" />
          </Form.Item>
          <Form.Item label="分类" name="categoryId">
            <Select
              allowClear
              placeholder="请选择分类"
              options={categories.map((item) => ({ label: item.name, value: item.id }))}
            />
          </Form.Item>
          <Form.Item label="摘要" name="excerpt">
            <Input.TextArea rows={2} placeholder="请输入摘要" />
          </Form.Item>
          <Form.Item
            label="正文（Markdown）"
            name="content"
            rules={[{ required: true, message: '请输入正文' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入 Markdown 正文内容" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              options={[
                { label: '草稿', value: 'draft' },
                { label: '已发布', value: 'published' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
