use HireMe;
go

alter table Skill
add SkillHierarchy hierarchyid;

alter table Skill
add SkillLevel as SkillHierarchy.GetLevel() persisted;

go


create or alter procedure getChilds(@SkillName nvarchar(100))
as begin

	declare @parent hierarchyid;
	select @parent = SkillHierarchy
	from Skill
	where Skillname = @SkillName;
 	
	select id, SkillHierarchy.ToString() as SkillHierarchy, replicate('	   ', SkillLevel) + SkillName as SkillName, SkillLevel
	from Skill
	where SkillHierarchy.IsDescendantOf(@parent) = 1
	and SkillHierarchy != @parent
	order by SkillHierarchy;

end;

go

exec getChilds @skillName = 'Backend';

go


create or alter procedure addChild(@ParentSkillName nvarchar(100) = '', @ChildSkillName nvarchar(100))
as begin

	if @ParentSkillName = ''
	begin
		insert into Skill
		values (@ChildSkillName, hierarchyid::GetRoot());
	
		
	end
	else 
	begin

		declare @parent hierarchyid;
		select @parent = SkillHierarchy 
		from Skill
		where SkillName = @ParentSkillName;

		declare @maxChild hierarchyid;
		select TOP 1 @maxChild = SkillHierarchy
		from Skill
		where SkillHierarchy.GetAncestor(1) = @parent
		order by SkillHierarchy desc;


		insert into Skill
		values (@ChildSkillName, @parent.GetDescendant(@maxChild, Null));

	end

end;

go
Delete Skill;
exec addChild @childSkillname = 'Programming';

exec addChild @parentSkillname = 'Programming', @childSkillname = 'Backend';
exec addChild @parentSkillname = 'Programming', @childSkillname = 'Frontend';
exec addChild @parentSkillname = 'Programming', @childSkillname = 'System programming';


exec addChild @parentSkillname = 'Backend', @childSkillname = 'GO';
exec addChild @parentSkillname = 'Backend', @childSkillname = 'Node.js';
exec addChild @parentSkillname = 'Backend', @childSkillname = 'Java';

exec addChild @parentSkillname = 'Frontend', @childSkillname = 'HTML';
exec addChild @parentSkillname = 'Frontend', @childSkillname = 'CSS';
exec addChild @parentSkillname = 'Frontend', @childSkillname = 'Sass';
exec addChild @parentSkillname = 'Frontend', @childSkillname = 'Angular';
exec addChild @parentSkillname = 'Frontend', @childSkillname = 'Vue';


exec getChilds @skillName = 'Programming';

go
create or alter procedure changeParent(@OldParentName nvarchar(100), @NewParentName nvarchar(100))
as
begin

    declare @OldParent hierarchyid;
    declare @NewParent hierarchyid;

    select @OldParent = SkillHierarchy
    from Skill
    where SkillName = @OldParentName;

    select @NewParent = SkillHierarchy
    from Skill
    where SkillName = @NewParentName;


    declare @Child hierarchyid;
    declare @NewNode hierarchyid;
    declare @LastChild hierarchyid;


    declare cur cursor for
        select SkillHierarchy
        from Skill
        where SkillHierarchy.GetAncestor(1) = @OldParent;

    open cur;
    fetch next from cur into @Child;

    while @@FETCH_STATUS = 0
    begin

        select top 1 @LastChild = SkillHierarchy
        from Skill
        where SkillHierarchy.GetAncestor(1) = @NewParent
        order by SkillHierarchy desc;

        set @NewNode = @NewParent.GetDescendant(@LastChild, NULL);


        update Skill
        set SkillHierarchy =
            SkillHierarchy.GetReparentedValue(@Child, @NewNode)
        where SkillHierarchy.IsDescendantOf(@Child) = 1;

        fetch next from cur into @Child;
    end

    close cur;
    Deallocate cur;

end
go


exec changeParent @oldParentname = 'Backend', @newParentname = 'Frontend';

