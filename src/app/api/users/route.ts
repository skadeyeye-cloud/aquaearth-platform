import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      include: {
        department: { select: { id: true, name: true, code: true } },
        manager: { select: { id: true, name: true, jobTitle: true } }
      }
    });

    const formatted = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatar: u.avatar || undefined,
      jobTitle: u.jobTitle,
      functionalRole: u.functionalRole as any,
      accessTier: u.accessTier as any,
      managementTier: u.managementTier as any,
      departmentId: u.departmentId || undefined,
      departmentName: u.department?.name || undefined,
      managerId: u.managerId || undefined,
      managerName: u.manager?.name || undefined,
      phone: u.phone || undefined,
      location: u.location || undefined,
      bio: u.bio || undefined,
      status: u.status as any,
      skills: u.skillsJson ? JSON.parse(u.skillsJson) : [],
      emergencyContact: u.emergencyContactJson ? JSON.parse(u.emergencyContactJson) : undefined
    }));

    return NextResponse.json({ success: true, users: formatted });
  } catch (error: any) {
    console.error('[API /api/users GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, phone, location, bio, skills, emergencyContact, avatar } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (location !== undefined) dataToUpdate.location = location;
    if (bio !== undefined) dataToUpdate.bio = bio;
    if (avatar !== undefined) dataToUpdate.avatar = avatar;
    if (skills !== undefined) dataToUpdate.skillsJson = JSON.stringify(skills);
    if (emergencyContact !== undefined) dataToUpdate.emergencyContactJson = JSON.stringify(emergencyContact);

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: {
        department: { select: { id: true, name: true, code: true } },
        manager: { select: { id: true, name: true, jobTitle: true } }
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatar: updated.avatar || undefined,
        jobTitle: updated.jobTitle,
        functionalRole: updated.functionalRole as any,
        accessTier: updated.accessTier as any,
        managementTier: updated.managementTier as any,
        departmentId: updated.departmentId || undefined,
        departmentName: updated.department?.name || undefined,
        managerId: updated.managerId || undefined,
        managerName: updated.manager?.name || undefined,
        phone: updated.phone || undefined,
        location: updated.location || undefined,
        bio: updated.bio || undefined,
        status: updated.status as any,
        skills: updated.skillsJson ? JSON.parse(updated.skillsJson) : [],
        emergencyContact: updated.emergencyContactJson ? JSON.parse(updated.emergencyContactJson) : undefined
      }
    });
  } catch (error: any) {
    console.error('[API /api/users PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
